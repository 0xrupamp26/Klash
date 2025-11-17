import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Market, MarketDocument } from '../schemas/market.schema';
import { TwitterIOService, Tweet } from '../twitterio/twitterio.service';
import { ControversyService, ControversyResult } from '../controversy/controversy.service';
import { AptosService } from '../aptos/aptos.service';

export interface CreateMarketResult {
  success: boolean;
  market?: Market;
  error?: string;
  message?: string;
}

@Injectable()
export class MarketCreatorService {
  private readonly logger = new Logger(MarketCreatorService.name);

  constructor(
    @InjectModel(Market.name) private marketModel: Model<MarketDocument>,
    private twitterIOService: TwitterIOService,
    private controversyService: ControversyService,
    private aptosService: AptosService,
  ) {}

  /**
   * Create a market from a tweet
   * @param tweet The tweet to create market from
   * @returns Market creation result
   */
  async createMarketFromTweet(tweet: Tweet): Promise<CreateMarketResult> {
    try {
      this.logger.log(`Processing tweet ${tweet.id} for market creation`);

      // Check if market already exists for this tweet
      const existingMarket = await this.marketModel.findOne({
        'tweetData.tweetId': tweet.id
      });

      if (existingMarket) {
        this.logger.log(`Market already exists for tweet ${tweet.id}`);
        return {
          success: false,
          error: 'Market already exists',
          message: `Market with ID ${existingMarket.marketId} already exists for this tweet`
        };
      }

      // Detect controversy
      const controversy = this.controversyService.detectControversy(tweet);
      
      if (!controversy.isControversy) {
        this.logger.log(`Tweet ${tweet.id} is not controversial enough`);
        return {
          success: false,
          error: 'Not controversial',
          message: `Confidence score: ${controversy.confidence}`
        };
      }

      // Generate unique market ID
      const marketId = `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Set closing time to 7 days from now
      const closingTime = new Date();
      closingTime.setDate(closingTime.getDate() + 7);

      // Calculate engagement score
      const engagementScore = tweet.engagement.likes + tweet.engagement.retweets + tweet.engagement.replies;

      // Create market document
      const market = new this.marketModel({
        marketId,
        question: controversy.title,
        outcomes: controversy.sides,
        originalTweetId: tweet.id,
        originalTweetText: tweet.text.substring(0, 200),
        originalTweetAuthor: tweet.author,
        status: 'OPEN',
        closingTime,
        source: 'twitter-lafdaAI',
        tweetData: {
          tweetId: tweet.id,
          tweetUrl: tweet.url,
          author: tweet.author,
          postedAt: tweet.postedAt,
          engagement: tweet.engagement,
          videoUrl: tweet.video_url,
        },
        engagementScore,
        sentimentTracking: {
          positiveSentiment: 0,
          negativeSentiment: 0,
          neutralSentiment: 0,
          lastUpdated: new Date(),
          sampleSize: 0,
        },
        metadata: {
          category: controversy.category,
          tags: ['twitter', 'lafdaAI', 'controversy'],
          controversyScore: controversy.confidence,
          createdBy: 'twitter-crawler',
        },
        pools: {
          total: 0,
          outcomeA: 0,
          outcomeB: 0,
        },
      });

      // Save market to database
      await market.save();

      // Deploy Aptos smart contract (try-catch to prevent blocking)
      try {
        this.logger.log(`Deploying Aptos contract for market ${marketId}`);
        const contractResult = await this.aptosService.createMarket(
          controversy.title,
          controversy.sides,
          closingTime.getTime()
        );
        
        this.logger.log(`Successfully deployed Aptos contract for market ${marketId} with transaction: ${contractResult.transactionHash}`);
      } catch (error) {
        this.logger.error(`Error deploying Aptos contract for market ${marketId}:`, error.message);
        // Don't fail the market creation if contract deployment fails
      }

      this.logger.log(`Successfully created market ${marketId} from tweet ${tweet.id}`);

      return {
        success: true,
        market,
        message: `Market created successfully with ID: ${marketId}`
      };

    } catch (error) {
      this.logger.error(`Error creating market from tweet ${tweet.id}:`, error.message);
      return {
        success: false,
        error: 'Creation failed',
        message: error.message
      };
    }
  }

  /**
   * Batch create markets from multiple tweets
   * @param tweets Array of tweets to process
   * @returns Batch creation results
   */
  async createMarketsFromTweets(tweets: Tweet[]): Promise<CreateMarketResult[]> {
    this.logger.log(`Creating markets from ${tweets.length} tweets`);

    const results = await Promise.allSettled(
      tweets.map(tweet => this.createMarketFromTweet(tweet))
    );

    const successfulMarkets = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failedMarkets = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

    this.logger.log(`Market creation complete: ${successfulMarkets} successful, ${failedMarkets} failed`);

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : {
        success: false,
        error: 'Promise rejected',
        message: result.reason?.message || 'Unknown error'
      }
    );
  }

  /**
   * Get markets by source
   * @param source The source filter (e.g., 'twitter-lafdaAI')
   * @param page Page number for pagination
   * @param limit Number of markets per page
   * @returns Paginated markets
   */
  async getMarketsBySource(
    source: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{ markets: Market[]; total: number; page: number; limit: number }> {
    this.logger.log(`Fetching markets for source: ${source}`);

    const skip = (page - 1) * limit;

    const [markets, total] = await Promise.all([
      this.marketModel
        .find({ source })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.marketModel.countDocuments({ source })
    ]);

    return {
      markets,
      total,
      page,
      limit
    };
  }

  /**
   * Update sentiment tracking for a market
   * @param marketId The market ID
   * @param sentimentData New sentiment data
   * @returns Update result
   */
  async updateSentimentTracking(
    marketId: string, 
    sentimentData: {
      positiveSentiment: number;
      negativeSentiment: number;
      neutralSentiment: number;
      sampleSize: number;
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.marketModel.updateOne(
        { marketId },
        {
          $set: {
            'sentimentTracking.positiveSentiment': sentimentData.positiveSentiment,
            'sentimentTracking.negativeSentiment': sentimentData.negativeSentiment,
            'sentimentTracking.neutralSentiment': sentimentData.neutralSentiment,
            'sentimentTracking.lastUpdated': new Date(),
            'sentimentTracking.sampleSize': sentimentData.sampleSize,
          }
        }
      );

      this.logger.log(`Updated sentiment tracking for market ${marketId}`);
      return { success: true, message: 'Sentiment tracking updated' };
    } catch (error) {
      this.logger.error(`Error updating sentiment tracking for market ${marketId}:`, error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get market statistics
   * @returns Market statistics
   */
  async getMarketStatistics(): Promise<{
    total: number;
    bySource: Record<string, number>;
    byStatus: Record<string, number>;
    avgEngagement: number;
  }> {
    const [total, bySource, byStatus] = await Promise.all([
      this.marketModel.countDocuments(),
      this.marketModel.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      this.marketModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const avgEngagement = await this.marketModel.aggregate([
      { $group: { _id: null, avgEngagement: { $avg: '$engagementScore' } } }
    ]);

    return {
      total,
      bySource: bySource.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      avgEngagement: avgEngagement[0]?.avgEngagement || 0,
    };
  }
}
