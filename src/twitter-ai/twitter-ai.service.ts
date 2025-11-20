import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface Tweet {
    id: string;
    text: string;
    url: string;
    author: string;
    postedAt: Date;
    engagement: {
        likes: number;
        retweets: number;
        replies: number;
    };
    video_url?: string;
}

export interface ControversyResult {
    isControversy: boolean;
    title: string;
    sides: string[];
    confidence: number;
    category: string;
}

export interface MarketCreationResult {
    success: boolean;
    market?: any;
    error?: string;
    message?: string;
}

@Injectable()
export class TwitterAiService {
    private readonly logger = new Logger(TwitterAiService.name);
    private readonly pythonServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.pythonServiceUrl = this.configService.get<string>(
            'PYTHON_SERVICE_URL',
            'http://localhost:8000',
        );
    }

    /**
     * Fetch tweets from @LafdaSinghAI
     * @param count Number of tweets to fetch
     * @returns Array of tweets
     */
    async fetchLafdaTweets(count: number = 20): Promise<Tweet[]> {
        try {
            this.logger.log(`Fetching ${count} tweets from @LafdaSinghAI`);

            const response = await firstValueFrom(
                this.httpService.get<{ tweets: Tweet[] }>(
                    `${this.pythonServiceUrl}/api/twitter/fetch-lafda`,
                    {
                        params: { count },
                        timeout: 30000,
                    },
                ),
            );

            this.logger.log(`Fetched ${response.data.tweets?.length || 0} tweets`);
            return response.data.tweets || [];
        } catch (error) {
            this.logger.error('Error fetching Lafda tweets:', error.message);
            return [];
        }
    }

    /**
     * Analyze tweets for controversy
     * @param tweets Array of tweets to analyze
     * @returns Array of controversy results
     */
    async analyzeControversy(tweets: Tweet[]): Promise<ControversyResult[]> {
        try {
            this.logger.log(`Analyzing ${tweets.length} tweets for controversy`);

            const response = await firstValueFrom(
                this.httpService.post<{ results: ControversyResult[] }>(
                    `${this.pythonServiceUrl}/api/controversy/analyze`,
                    { tweets },
                    { timeout: 30000 },
                ),
            );

            const controversies = response.data.results?.filter(r => r.isControversy) || [];
            this.logger.log(`Found ${controversies.length} controversial tweets`);

            return response.data.results || [];
        } catch (error) {
            this.logger.error('Error analyzing controversy:', error.message);
            return [];
        }
    }

    /**
     * Create markets from controversial tweets
     * @param tweets Array of tweets
     * @returns Market creation results
     */
    async createMarketsFromTweets(tweets: Tweet[]): Promise<MarketCreationResult[]> {
        try {
            this.logger.log(`Creating markets from ${tweets.length} tweets`);

            const response = await firstValueFrom(
                this.httpService.post<{ results: MarketCreationResult[] }>(
                    `${this.pythonServiceUrl}/api/markets/create-from-tweets`,
                    { tweets },
                    { timeout: 60000 },
                ),
            );

            const successful = response.data.results?.filter(r => r.success).length || 0;
            this.logger.log(`Successfully created ${successful} markets`);

            return response.data.results || [];
        } catch (error) {
            this.logger.error('Error creating markets from tweets:', error.message);
            return [];
        }
    }

    /**
     * Full pipeline: Fetch tweets, analyze, and create markets
     * @returns Pipeline execution result
     */
    async runMarketCreationPipeline(): Promise<{
        tweetsFetched: number;
        controversiesFound: number;
        marketsCreated: number;
        errors: string[];
    }> {
        const errors: string[] = [];

        try {
            // Step 1: Fetch tweets
            const tweets = await this.fetchLafdaTweets(50);
            if (tweets.length === 0) {
                errors.push('No tweets fetched');
                return { tweetsFetched: 0, controversiesFound: 0, marketsCreated: 0, errors };
            }

            // Step 2: Analyze for controversy
            const controversyResults = await this.analyzeControversy(tweets);
            const controversialTweets = tweets.filter((tweet, index) =>
                controversyResults[index]?.isControversy
            );

            if (controversialTweets.length === 0) {
                errors.push('No controversial tweets found');
                return {
                    tweetsFetched: tweets.length,
                    controversiesFound: 0,
                    marketsCreated: 0,
                    errors
                };
            }

            // Step 3: Create markets
            const marketResults = await this.createMarketsFromTweets(controversialTweets);
            const marketsCreated = marketResults.filter(r => r.success).length;

            this.logger.log(
                `Pipeline complete: ${tweets.length} tweets → ${controversialTweets.length} controversies → ${marketsCreated} markets`,
            );

            return {
                tweetsFetched: tweets.length,
                controversiesFound: controversialTweets.length,
                marketsCreated,
                errors,
            };
        } catch (error) {
            this.logger.error('Error in market creation pipeline:', error.message);
            errors.push(error.message);
            return { tweetsFetched: 0, controversiesFound: 0, marketsCreated: 0, errors };
        }
    }
}
