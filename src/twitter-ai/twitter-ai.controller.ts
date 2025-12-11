import { Controller, Get, Post, Logger } from '@nestjs/common';
import { TwitterAiService } from './twitter-ai.service';
import { TwitterAiScheduler } from './twitter-ai.scheduler';

@Controller('twitter-ai')
export class TwitterAiController {
  private readonly logger = new Logger(TwitterAiController.name);

  constructor(
    private readonly twitterAiService: TwitterAiService,
    private readonly twitterAiScheduler: TwitterAiScheduler,
  ) {}

  /**
   * Manually trigger the market creation pipeline
   */
  @Post('run-pipeline')
  async runPipeline() {
    this.logger.log('Manual pipeline trigger requested');
    const result = await this.twitterAiService.runMarketCreationPipeline();

    return {
      success: result.marketsCreated > 0,
      data: result,
      message: `Created ${result.marketsCreated} markets from ${result.tweetsFetched} tweets`,
    };
  }

  /**
   * Fetch latest tweets from @LafdaSinghAI
   */
  @Get('fetch-tweets')
  async fetchTweets() {
    const tweets = await this.twitterAiService.fetchLafdaTweets(20);

    return {
      success: true,
      data: tweets,
      count: tweets.length,
    };
  }

  /**
   * Test controversy detection
   */
  @Post('test-controversy')
  async testControversy() {
    const tweets = await this.twitterAiService.fetchLafdaTweets(10);
    const results = await this.twitterAiService.analyzeControversy(tweets);

    const controversies = results.filter((r) => r.isControversy);

    return {
      success: true,
      data: {
        totalTweets: tweets.length,
        controversiesFound: controversies.length,
        controversies,
      },
    };
  }

  /**
   * Get pipeline status
   */
  @Get('status')
  async getStatus() {
    return {
      success: true,
      data: {
        service: 'Twitter AI Integration',
        status: 'active',
        schedule: 'Every 30 minutes',
        pythonServiceUrl:
          process.env.PYTHON_SERVICE_URL || 'http://localhost:8000',
      },
    };
  }
}
