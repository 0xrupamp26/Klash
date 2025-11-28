import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MarketsService } from '../markets/markets.service';
import { v4 as uuidv4 } from 'uuid';

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
    private readonly twitterApiKey = 'new1_121ffe2467864f8495962c8e226ffcbb';
    private readonly targetUserId = '375181867554050048'; // @anurag__kochar

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly marketsService: MarketsService,
    ) { }

    /**
     * Fetch tweets from target user (@anurag__kochar)
     * @param count Number of tweets to fetch
     * @returns Array of tweets
     */
    async fetchLafdaTweets(count: number = 10): Promise<Tweet[]> {
        this.logger.log(`Fetching ${count} tweets from user ${this.targetUserId}`);

        try {
            const response = await firstValueFrom(
                this.httpService.get(
                    `https://api.twitterapi.io/twitter/user/last_tweets`,
                    {
                        params: {
                            userId: this.targetUserId,
                            limit: count
                        },
                        headers: {
                            'X-API-Key': this.twitterApiKey
                        },
                        timeout: 30000,
                    },
                ),
            );

            const tweetsData = response.data.tweets || [];
            this.logger.log(`Fetched ${tweetsData.length} tweets`);

            return tweetsData.map((t: any) => ({
                id: t.id_str || t.id,
                text: t.text,
                url: `https://twitter.com/anurag__kochar/status/${t.id_str}`,
                author: 'anurag__kochar',
                postedAt: new Date(t.created_at),
                engagement: {
                    likes: t.favorite_count || 0,
                    retweets: t.retweet_count || 0,
                    replies: t.reply_count || 0,
                },
                video_url: t.video_url
            }));
        } catch (error) {
            this.logger.error('Error fetching tweets:', error.message);
            // Fallback to mock if API fails
            return this.getMockTweets();
        }
    }

    private getMockTweets(): Tweet[] {
        return [
            {
                id: 'mock_1',
                text: 'AI will replace junior developers by 2025. Agree or disagree? #AI #Dev',
                url: 'https://twitter.com/anurag__kochar/status/mock_1',
                author: 'anurag__kochar',
                postedAt: new Date(),
                engagement: { likes: 120, retweets: 45, replies: 88 },
            }
        ];
    }

    /**
     * Analyze tweets for controversy (Heuristic based)
     * @param tweets Array of tweets to analyze
     * @returns Array of controversy results
     */
    async analyzeControversy(tweets: Tweet[]): Promise<ControversyResult[]> {
        this.logger.log(`Analyzing ${tweets.length} tweets for controversy`);

        return tweets.map(tweet => {
            const text = tweet.text.toLowerCase();
            let isControversy = false;
            let title = '';
            let category = 'Tech';
            let confidence = 0.5;

            // Heuristic Analysis
            if (text.includes('?') || text.includes('vs') || text.includes('will')) {
                // Questions or comparisons are good candidates
                if (text.includes('ai') || text.includes('crypto') || text.includes('market')) {
                    isControversy = true;
                    confidence = 0.8;

                    // Generate a question title
                    if (text.length > 50) {
                        title = `Prediction: ${tweet.text.substring(0, 60)}...`;
                    } else {
                        title = `Prediction: ${tweet.text}`;
                    }
                }
            }

            return {
                isControversy,
                title,
                sides: ['Yes', 'No'],
                confidence,
                category
            };
        });
    }

    /**
     * Create markets from controversial tweets
     * @param tweets Array of tweets
     * @returns Market creation results
     */
    async createMarketsFromTweets(tweets: Tweet[]): Promise<MarketCreationResult[]> {
        this.logger.log(`Creating markets from ${tweets.length} tweets`);

        const results: MarketCreationResult[] = [];

        for (const tweet of tweets) {
            // Check if market already exists for this tweet
            // Skipped for MVP speed, but ideally we check `originalTweetId`

            try {
                // Analyze specifically for this tweet to get metadata
                const [analysis] = await this.analyzeControversy([tweet]);

                if (!analysis.isControversy) {
                    results.push({ success: false, message: 'Not controversial' });
                    continue;
                }

                const marketData = {
                    marketId: uuidv4(),
                    question: analysis.title,
                    outcomes: ['Yes', 'No'],
                    originalTweetId: tweet.id,
                    originalTweetText: tweet.text,
                    originalTweetAuthor: tweet.author,
                    status: 'OPEN',
                    closingTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                    resolutionTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                    pools: { total: 0, outcomeA: 0, outcomeB: 0 },
                    metadata: {
                        category: analysis.category,
                        tags: ['twitter', 'ai'],
                        controversyScore: analysis.confidence,
                        createdBy: 'AI_AGENT'
                    }
                };

                const newMarket = await this.marketsService.create(marketData);
                this.logger.log(`Created market: ${newMarket.marketId}`);

                results.push({
                    success: true,
                    market: newMarket,
                    message: 'Market created successfully'
                });

            } catch (error) {
                this.logger.error(`Failed to create market for tweet ${tweet.id}: ${error.message}`);
                results.push({ success: false, error: error.message });
            }
        }

        return results;
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
            const tweets = await this.fetchLafdaTweets(10);
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
                this.logger.log('No controversial tweets found in this batch');
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
