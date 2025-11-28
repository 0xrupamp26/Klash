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
     * Fetch tweets from @LafdaSinghAI (MOCKED)
     * @param count Number of tweets to fetch
     * @returns Array of tweets
     */
    async fetchLafdaTweets(count: number = 20): Promise<Tweet[]> {
        this.logger.log(`[MOCK] Fetching ${count} tweets from @LafdaSinghAI`);

        // Return mock tweets
        return [
            {
                id: '1859123456789012345',
                text: 'BREAKING: Elon Musk challenges Mark Zuckerberg to a cage match at the Colosseum! 🏟️🥊 #MuskVsZuck',
                url: 'https://twitter.com/LafdaSinghAI/status/1859123456789012345',
                author: 'LafdaSinghAI',
                postedAt: new Date(),
                engagement: { likes: 5000, retweets: 1200, replies: 800 },
                video_url: ''
            },
            {
                id: '1859123456789012346',
                text: 'Rumor: Apple to acquire Disney for $200B? Analysts say it could happen this year. 🍎🏰 #AppleDisney',
                url: 'https://twitter.com/LafdaSinghAI/status/1859123456789012346',
                author: 'LafdaSinghAI',
                postedAt: new Date(),
                engagement: { likes: 3500, retweets: 900, replies: 400 },
                video_url: ''
            },
            {
                id: '1859123456789012347',
                text: 'Just watched the new Marvel movie. It was okay, not great. 🎬',
                url: 'https://twitter.com/LafdaSinghAI/status/1859123456789012347',
                author: 'LafdaSinghAI',
                postedAt: new Date(),
                engagement: { likes: 100, retweets: 10, replies: 5 },
                video_url: ''
            }
        ];
    }

    /**
     * Analyze tweets for controversy (MOCKED)
     * @param tweets Array of tweets to analyze
     * @returns Array of controversy results
     */
    async analyzeControversy(tweets: Tweet[]): Promise<ControversyResult[]> {
        this.logger.log(`[MOCK] Analyzing ${tweets.length} tweets for controversy`);

        return tweets.map(tweet => {
            const text = tweet.text.toLowerCase();
            let isControversy = false;
            let title = '';
            let sides = ['Yes', 'No'];
            let category = 'General';

            if (text.includes('musk') && text.includes('zuck')) {
                isControversy = true;
                title = 'Will Elon Musk fight Mark Zuckerberg in 2025?';
                category = 'Sports';
            } else if (text.includes('apple') && text.includes('disney')) {
                isControversy = true;
                title = 'Will Apple acquire Disney by end of 2025?';
                category = 'Business';
            }

            return {
                isControversy,
                title: title || `Prediction: ${tweet.text.substring(0, 30)}...`,
                sides,
                confidence: isControversy ? 0.95 : 0.1,
                category
            };
        });
    }

    /**
     * Create markets from controversial tweets (MOCKED)
     * @param tweets Array of tweets
     * @returns Market creation results
     */
    async createMarketsFromTweets(tweets: Tweet[]): Promise<MarketCreationResult[]> {
        this.logger.log(`[MOCK] Creating markets from ${tweets.length} tweets`);

        // In a real mock, we would inject MarketsService and call create()
        // For now, we'll just simulate success to avoid circular dependency issues in this quick fix
        // The actual creation logic should be moved to a higher-level orchestration service

        return tweets.map(t => ({
            success: true,
            message: 'Market created successfully (Mock)',
            market: { id: 'mock_market_' + t.id, question: 'Mock Question' }
        }));
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
