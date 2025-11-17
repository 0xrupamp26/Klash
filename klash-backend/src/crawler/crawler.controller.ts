import { Controller, Get, Post, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CrawlerService } from './crawler.service';
import type { CrawlerStatus } from './crawler.service';
import { MarketCreatorService } from '../market-creator/market-creator.service';

@ApiTags('Crawler')
@Controller('crawler')
export class CrawlerController {
  private readonly logger = new Logger(CrawlerController.name);

  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly marketCreatorService: MarketCreatorService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Get crawler status and statistics' })
  @ApiResponse({ status: 200, description: 'Returns crawler status' })
  getCrawlerStatus(): CrawlerStatus {
    this.logger.log('Fetching crawler status');
    return this.crawlerService.getCrawlerStatus();
  }

  @Post('run')
  @ApiOperation({ summary: 'Manually trigger the Twitter crawler' })
  @ApiResponse({ status: 200, description: 'Returns crawler run results' })
  @ApiResponse({ status: 409, description: 'Crawler is already running' })
  async runCrawler(): Promise<{
    success: boolean;
    message: string;
    tweetsProcessed: number;
    marketsCreated: number;
    controversiesFound: number;
    duration: number;
  }> {
    this.logger.log('Manual crawler trigger requested');
    return await this.crawlerService.runCrawler();
  }

  @Get('test')
  @ApiOperation({ summary: 'Test the crawler pipeline' })
  @ApiResponse({ status: 200, description: 'Returns test results for all components' })
  async testCrawler(): Promise<{
    success: boolean;
    message: string;
    steps: Array<{ step: string; success: boolean; message: string }>;
  }> {
    this.logger.log('Running crawler pipeline test');
    return await this.crawlerService.testCrawler();
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset crawler status (for debugging)' })
  @ApiResponse({ status: 200, description: 'Crawler status reset successfully' })
  resetStatus(): { message: string } {
    this.logger.log('Resetting crawler status');
    this.crawlerService.resetStatus();
    return { message: 'Crawler status reset successfully' };
  }

  @Get('markets/statistics')
  @ApiOperation({ summary: 'Get market creation statistics' })
  @ApiResponse({ status: 200, description: 'Returns market statistics' })
  async getMarketStatistics(): Promise<{
    total: number;
    bySource: Record<string, number>;
    byStatus: Record<string, number>;
    avgEngagement: number;
  }> {
    this.logger.log('Fetching market statistics');
    return await this.marketCreatorService.getMarketStatistics();
  }

  @Get('markets/by-source')
  @ApiOperation({ summary: 'Get markets by source (e.g., twitter-lafdaAI)' })
  @ApiQuery({ name: 'source', required: false, description: 'Source filter (default: twitter-lafdaAI)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Returns paginated markets by source' })
  async getMarketsBySource(
    @Query('source') source: string = 'twitter-lafdaAI',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    markets: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.logger.log(`Fetching markets for source: ${source}`);
    return await this.marketCreatorService.getMarketsBySource(source, page, limit);
  }
}
