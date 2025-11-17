import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TwitterIOService } from '../twitterio/twitterio.service';
import { MarketCreatorService } from '../market-creator/market-creator.service';
import { Market, MarketDocument } from '../schemas/market.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface CrawlerStatus {
  isRunning: boolean;
  lastRun: Date | null;
  lastRunDuration: number;
  marketsCreated: number;
  totalTweetsProcessed: number;
  totalControversiesFound: number;
  nextRun: Date;
  error?: string;
}

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private isRunning = false;
  private lastRun: Date | null = null;
  private lastRunDuration = 0;
  private marketsCreated = 0;
  private totalTweetsProcessed = 0;
  private totalControversiesFound = 0;

  constructor(
    private twitterIOService: TwitterIOService,
    private marketCreatorService: MarketCreatorService,
    @InjectModel(Market.name) private marketModel: Model<MarketDocument>,
  ) {}

  /**
   * Scheduled job: Run crawler every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async scheduledCrawl(): Promise<void> {
    this.logger.log('Starting scheduled Twitter crawler run');
    await this.runCrawler();
  }

  /**
   * Manual trigger for crawler
   * @returns Crawler results
   */
  async runCrawler(): Promise<{
    success: boolean;
    message: string;
    tweetsProcessed: number;
    marketsCreated: number;
    controversiesFound: number;
    duration: number;
  }> {
    if (this.isRunning) {
      return {
        success: false,
        message: 'Crawler is already running',
        tweetsProcessed: 0,
        marketsCreated: 0,
        controversiesFound: 0,
        duration: 0,
      };
    }

    this.isRunning = true;
    const startTime = Date.now();
    this.marketsCreated = 0;
    this.totalTweetsProcessed = 0;
    this.totalControversiesFound = 0;

    try {
      this.logger.log('Starting Twitter crawler for @LafdaSinghAI');

      // Step 1: Fetch tweets from @LafdaSinghAI
      const tweetResponse = await this.twitterIOService.fetchUserTweets('LafdaSinghAI', 100);

      if (tweetResponse.error) {
        throw new Error(`Failed to fetch tweets: ${tweetResponse.error}`);
      }

      const tweets = tweetResponse.data || [];
      this.totalTweetsProcessed = tweets.length;
      this.logger.log(`Fetched ${tweets.length} tweets from @LafdaSinghAI`);

      // Step 2: Filter out already processed tweets
      const existingTweetIds = await this.getExistingTweetIds();
      const newTweets = tweets.filter(tweet => !existingTweetIds.includes(tweet.id));
      
      this.logger.log(`Found ${newTweets.length} new tweets to process`);

      if (newTweets.length === 0) {
        this.logger.log('No new tweets to process');
        return {
          success: true,
          message: 'No new tweets to process',
          tweetsProcessed: this.totalTweetsProcessed,
          marketsCreated: 0,
          controversiesFound: 0,
          duration: Date.now() - startTime,
        };
      }

      // Step 3: Create markets from new tweets
      const results = await this.marketCreatorService.createMarketsFromTweets(newTweets);
      
      // Count successful market creations
      this.marketsCreated = results.filter(r => r.success).length;
      this.totalControversiesFound = results.filter(r => r.success).length;

      const duration = Date.now() - startTime;
      this.lastRun = new Date();
      this.lastRunDuration = duration;

      this.logger.log(`Crawler completed successfully:
        - Tweets processed: ${this.totalTweetsProcessed}
        - New tweets: ${newTweets.length}
        - Markets created: ${this.marketsCreated}
        - Duration: ${duration}ms`);

      return {
        success: true,
        message: `Crawler completed successfully. Created ${this.marketsCreated} markets from ${newTweets.length} new tweets`,
        tweetsProcessed: this.totalTweetsProcessed,
        marketsCreated: this.marketsCreated,
        controversiesFound: this.totalControversiesFound,
        duration,
      };

    } catch (error) {
      this.logger.error('Crawler run failed:', error.message);
      
      const duration = Date.now() - startTime;
      this.lastRun = new Date();
      this.lastRunDuration = duration;

      return {
        success: false,
        message: `Crawler failed: ${error.message}`,
        tweetsProcessed: this.totalTweetsProcessed,
        marketsCreated: this.marketsCreated,
        controversiesFound: this.totalControversiesFound,
        duration,
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get crawler status
   * @returns Current crawler status
   */
  getCrawlerStatus(): CrawlerStatus {
    // Calculate next run time (every 6 hours)
    const nextRun = new Date();
    if (this.lastRun) {
      nextRun.setTime(this.lastRun.getTime() + (6 * 60 * 60 * 1000));
    } else {
      nextRun.setHours(nextRun.getHours() + 6);
    }

    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      lastRunDuration: this.lastRunDuration,
      marketsCreated: this.marketsCreated,
      totalTweetsProcessed: this.totalTweetsProcessed,
      totalControversiesFound: this.totalControversiesFound,
      nextRun,
    };
  }

  /**
   * Get existing tweet IDs to avoid duplicates
   * @returns Array of existing tweet IDs
   */
  private async getExistingTweetIds(): Promise<string[]> {
    const markets = await this.marketModel
      .find({ 'tweetData.tweetId': { $exists: true } })
      .select('tweetData.tweetId')
      .exec();

    return markets.map(m => m.tweetData?.tweetId).filter(Boolean);
  }

  /**
   * Test the entire crawler pipeline
   * @returns Test results
   */
  async testCrawler(): Promise<{
    success: boolean;
    message: string;
    steps: Array<{ step: string; success: boolean; message: string }>;
  }> {
    const steps: Array<{ step: string; success: boolean; message: string }> = [];
    let overallSuccess = true;

    // Step 1: Test Twitter.io API connection
    try {
      const connectionTest = await this.twitterIOService.testConnection();
      steps.push({
        step: 'Twitter.io API Connection',
        success: connectionTest.success,
        message: connectionTest.message
      });
      if (!connectionTest.success) overallSuccess = false;
    } catch (error) {
      steps.push({
        step: 'Twitter.io API Connection',
        success: false,
        message: error.message
      });
      overallSuccess = false;
    }

    // Step 2: Test tweet fetching
    try {
      const tweetTest = await this.twitterIOService.fetchUserTweets('LafdaSinghAI', 5);
      if (tweetTest.error) {
        steps.push({
          step: 'Tweet Fetching',
          success: false,
          message: tweetTest.error
        });
        overallSuccess = false;
      } else {
        steps.push({
          step: 'Tweet Fetching',
          success: true,
          message: `Successfully fetched ${tweetTest.data?.length || 0} tweets`
        });
      }
    } catch (error) {
      steps.push({
        step: 'Tweet Fetching',
        success: false,
        message: error.message
      });
      overallSuccess = false;
    }

    // Step 3: Test market creation
    try {
      const stats = await this.marketCreatorService.getMarketStatistics();
      steps.push({
        step: 'Market Creation Service',
        success: true,
        message: `Service active. Total markets: ${stats.total}`
      });
    } catch (error) {
      steps.push({
        step: 'Market Creation Service',
        success: false,
        message: error.message
      });
      overallSuccess = false;
    }

    return {
      success: overallSuccess,
      message: overallSuccess ? 'All tests passed' : 'Some tests failed',
      steps
    };
  }

  /**
   * Force reset crawler status (for debugging)
   */
  resetStatus(): void {
    this.isRunning = false;
    this.lastRun = null;
    this.lastRunDuration = 0;
    this.marketsCreated = 0;
    this.totalTweetsProcessed = 0;
    this.totalControversiesFound = 0;
    this.logger.log('Crawler status reset');
  }
}
