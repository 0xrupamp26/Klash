import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TwitterAiService } from './twitter-ai.service';

@Injectable()
export class TwitterAiScheduler {
    private readonly logger = new Logger(TwitterAiScheduler.name);
    private isRunning = false;

    constructor(private readonly twitterAiService: TwitterAiService) { }

    /**
     * Run market creation pipeline every 30 minutes
     */
    @Cron(CronExpression.EVERY_30_MINUTES)
    async handleMarketCreation() {
        if (this.isRunning) {
            this.logger.warn('Market creation pipeline is already running, skipping...');
            return;
        }

        this.isRunning = true;
        this.logger.log('Starting scheduled market creation pipeline');

        try {
            const result = await this.twitterAiService.runMarketCreationPipeline();

            this.logger.log(
                `Pipeline completed: ${result.tweetsFetched} tweets, ` +
                `${result.controversiesFound} controversies, ` +
                `${result.marketsCreated} markets created`,
            );

            if (result.errors.length > 0) {
                this.logger.error('Pipeline errors:', result.errors);
            }
        } catch (error) {
            this.logger.error('Error in scheduled market creation:', error.message);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Manual trigger for testing
     */
    async triggerManually(): Promise<any> {
        this.logger.log('Manually triggering market creation pipeline');
        return await this.twitterAiService.runMarketCreationPipeline();
    }
}
