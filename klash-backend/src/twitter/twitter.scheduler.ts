import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TwitterControversyService } from './twitter-controversy.service';

@Injectable()
export class TwitterScheduler {
  private readonly logger = new Logger(TwitterScheduler.name);
  private readonly SEARCH_QUERIES = [
    'crypto hack',
    'rug pull',
    'aptos scam',
    'move club drama'
  ];
  
  private readonly INFLUENCERS = [
    'elonmusk',
    'VitalikButerin',
    'cz_binance',
    'SBF_FTX'
  ];

  constructor(
    private readonly twitterService: TwitterControversyService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async detectControversies() {
    this.logger.log('Starting scheduled controversy detection...');
    
    try {
      for (const query of this.SEARCH_QUERIES) {
        try {
          this.logger.log(`Searching for controversies with query: ${query}`);
          const results = await this.twitterService.searchControversies(query);
          this.logger.log(`Found ${results.length} controversies for query: ${query}`);
        } catch (error) {
          this.logger.error(`Error searching for controversies with query ${query}: ${error.message}`, error.stack);
        }
      }

      // After finding controversies, try to create markets
      await this.autoCreateMarkets();
      
    } catch (error) {
      this.logger.error(`Error in detectControversies: ${error.message}`, error.stack);
    }
  }

  @Cron('*/30 * * * *')
  async monitorInfluencers() {
    this.logger.log('Starting scheduled influencer monitoring...');
    
    try {
      for (const username of this.INFLUENCERS) {
        try {
          this.logger.log(`Monitoring influencer: @${username}`);
          const results = await this.twitterService.monitorInfluencer(username);
          this.logger.log(`Found ${results.length} controversial tweets from @${username}`);
        } catch (error) {
          this.logger.error(`Error monitoring influencer @${username}: ${error.message}`, error.stack);
        }
      }
    } catch (error) {
      this.logger.error(`Error in monitorInfluencers: ${error.message}`, error.stack);
    }
  }

  @Cron('0 */6 * * *')
  async resolveExpiredMarkets() {
    this.logger.log('Checking for expired markets to resolve...');
    
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      // Find markets that are marked as MARKET_CREATED and are past their resolution time
      const expiredMarkets = await this.twitterService.findAll({
        status: 'MARKET_CREATED',
        // Assuming there's a marketExpiresAt field
        marketExpiresAt: { $lte: now },
        // Only process markets that haven't been processed in the last hour
        updatedAt: { $lte: oneHourAgo }
      });
      
      this.logger.log(`Found ${expiredMarkets.length} expired markets to resolve`);
      
      for (const market of expiredMarkets) {
        try {
          if (!market.marketId) {
            this.logger.warn(`Skipping market resolution - no marketId for tweet ${market.tweetId}`);
            continue;
          }
          this.logger.log(`Resolving market ${market.marketId} for tweet ${market.tweetId}`);
          await this.twitterService.resolveMarket(market.marketId, market.tweetId);
          this.logger.log(`Successfully resolved market ${market.marketId}`);
        } catch (error) {
          this.logger.error(`Error resolving market ${market.marketId}: ${error.message}`, error.stack);
        }
      }
    } catch (error) {
      this.logger.error(`Error in resolveExpiredMarkets: ${error.message}`, error.stack);
    }
  }

  // Helper method to be called after finding new controversies
  private async autoCreateMarkets() {
    try {
      this.logger.log('Auto-creating markets for high-scoring controversies...');
      const createdMarkets = await this.twitterService.autoCreateMarkets();
      this.logger.log(`Created ${createdMarkets.length} new markets`);
    } catch (error) {
      this.logger.error(`Error in autoCreateMarkets: ${error.message}`, error.stack);
    }
  }
}
