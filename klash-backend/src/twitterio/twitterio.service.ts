import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface Tweet {
  id: string;
  text: string;
  url: string;
  video_url?: string;
  author: string;
  postedAt: Date;
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
  };
}

export interface TweetResponse {
  data?: Tweet[];
  error?: string;
  message?: string;
}

@Injectable()
export class TwitterIOService {
  private readonly logger = new Logger(TwitterIOService.name);
  private readonly axios: any;
  private readonly apiKey: string;
  private readonly userId: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('TWITTER_IO_API_KEY') || '';
    this.userId = this.configService.get<string>('TWITTER_IO_USER_ID') || '';
    this.baseUrl = 'https://api.twitter.io'; // Twitter.io API base URL
    
    this.axios = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add logging for requests
    this.axios.interceptors.request.use(
      (config) => {
        this.logger.debug(`Making request to: ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add logging for responses
    this.axios.interceptors.response.use(
      (response) => {
        this.logger.debug(`Response from: ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error('Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Fetch tweets from a specific user
   * @param username Twitter username (e.g., 'LafdaSinghAI')
   * @param limit Maximum number of tweets to fetch
   * @returns Array of tweets
   */
  async fetchUserTweets(username: string, limit: number = 100): Promise<TweetResponse> {
    try {
      this.logger.log(`Fetching ${limit} tweets from @${username}`);
      
      // Twitter.io API endpoint for user timeline
      const response = await this.axios.post('/timeline/user', {
        username,
        limit,
        include_videos: true, // Only fetch video tweets
        user_id: this.userId,
      });

      const tweets: Tweet[] = response.data?.data?.map((tweet: any) => ({
        id: tweet.id,
        text: tweet.text || tweet.full_text,
        url: `https://twitter.com/${username}/status/${tweet.id}`,
        video_url: tweet.video?.url || tweet.extended_entities?.media?.[0]?.video_info?.variants?.[0]?.url,
        author: username,
        postedAt: new Date(tweet.created_at),
        engagement: {
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          replies: tweet.public_metrics?.reply_count || 0,
        },
      })) || [];

      // Filter for video tweets only and high engagement
      const videoTweets = tweets.filter(tweet => {
        const hasVideo = tweet.video_url || tweet.text.toLowerCase().includes('video');
        const highEngagement = (tweet.engagement.likes + tweet.engagement.retweets + tweet.engagement.replies) > 1000;
        return hasVideo && highEngagement;
      });

      this.logger.log(`Successfully fetched ${videoTweets.length} video tweets from @${username}`);
      
      return { data: videoTweets };
    } catch (error) {
      this.logger.error(`Error fetching tweets from @${username}:`, error.response?.data || error.message);
      return { 
        error: 'Failed to fetch tweets', 
        message: error.response?.data?.message || error.message 
      };
    }
  }

  /**
   * Fetch replies for a specific tweet
   * @param tweetId The ID of the tweet to fetch replies for
   * @returns Array of reply tweets
   */
  async getTweetReplies(tweetId: string): Promise<TweetResponse> {
    try {
      this.logger.log(`Fetching replies for tweet ${tweetId}`);
      
      const response = await this.axios.post('/timeline/replies', {
        tweet_id: tweetId,
        limit: 50,
      });

      const replies: Tweet[] = response.data?.data?.map((tweet: any) => ({
        id: tweet.id,
        text: tweet.text || tweet.full_text,
        url: `https://twitter.com/${tweet.author?.username || 'user'}/status/${tweet.id}`,
        author: tweet.author?.username || 'anonymous',
        postedAt: new Date(tweet.created_at),
        engagement: {
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          replies: tweet.public_metrics?.reply_count || 0,
        },
      })) || [];

      this.logger.log(`Successfully fetched ${replies.length} replies for tweet ${tweetId}`);
      
      return { data: replies };
    } catch (error) {
      this.logger.error(`Error fetching replies for tweet ${tweetId}:`, error.response?.data || error.message);
      return { 
        error: 'Failed to fetch replies', 
        message: error.response?.data?.message || error.message 
      };
    }
  }

  /**
   * Test the Twitter.io API connection
   * @returns Connection status
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Try to fetch a small number of tweets to test connection
      const response = await this.fetchUserTweets('LafdaSinghAI', 1);
      
      if (response.error) {
        return { success: false, message: response.error };
      }
      
      return { 
        success: true, 
        message: `Successfully connected to Twitter.io API. API Key: ${this.apiKey?.substring(0, 10)}...` 
      };
    } catch (error) {
      this.logger.error('Twitter.io API connection test failed:', error.message);
      return { 
        success: false, 
        message: `Connection failed: ${error.message}` 
      };
    }
  }
}
