import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import * as PythonShell from 'python-shell';
import { join } from 'path';
import { 
  Tweet, 
  UserProfile, 
  TrendingTopic, 
  TwitterApiResponse 
} from '../common/interfaces/twitter-response.interface';
import { Market, MarketDocument } from './schemas/market.schema';
import { TweetAnalysis, TweetAnalysisDocument } from './schemas/tweet-analysis.schema';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Service responsible for interacting with the Twitter API
 */
@Injectable()
export class TwitterService {
  private readonly logger = new Logger(TwitterService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly pythonPath: string;
  private readonly pythonScriptsPath: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(Market.name) private marketModel: Model<MarketDocument>,
    @InjectModel(TweetAnalysis.name) private tweetAnalysisModel: Model<TweetAnalysisDocument>,
  ) {
    const apiKey = this.configService.get<string>('TWITTER_API_KEY');
    const baseUrl = this.configService.get<string>('TWITTER_API_BASE_URL');
    this.pythonPath = this.configService.get<string>('PYTHON_PATH', 'python');
    this.pythonScriptsPath = join(process.cwd(), 'src', 'python');
    
    if (!apiKey) {
      throw new Error('TWITTER_API_KEY is not defined in environment variables');
    }
    
    if (!baseUrl) {
      throw new Error('TWITTER_API_BASE_URL is not defined in environment variables');
    }
    
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Creates headers for Twitter API requests
   * @private
   */
  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Handles errors from Twitter API
   * @private
   * @param error - The error object
   * @param context - Additional context about where the error occurred
   * @throws {HttpException}
   */
  private handleError(error: any, context: string): never {
    this.logger.error(`Twitter API error in ${context}:`, error);

    if (error.isAxiosError) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        const { status, data } = axiosError.response;
        const message = typeof data === 'object' ? JSON.stringify(data) : data || 'Twitter API error';
        
        throw new HttpException(
          { statusCode: status, message, error: 'Twitter API Error' },
          status,
        );
      }
      
      if (axiosError.request) {
        throw new HttpException(
          { statusCode: HttpStatus.SERVICE_UNAVAILABLE, error: 'Service Unavailable', message: 'Twitter API is not responding' },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }
    
    throw new HttpException(
      { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, error: 'Internal Server Error', message: 'An unexpected error occurred' },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Search for tweets based on a query
   * @param query Search query string
   * @param count Number of tweets to return (max 200, default 100)
   * @returns Promise with tweet data
   */
  /**
   * Searches for tweets matching the given query
   * @param query - The search query
   * @param count - Number of tweets to return (max 200, default 100)
   * @returns Promise with tweet data and metadata
   * @throws {HttpException} If the request fails
   */
  async searchTweets(query: string, count = 100): Promise<TwitterApiResponse<Tweet[]>> {
    const url = `${this.baseUrl}/twitter/tweet/search`;
    const params = {
      query: query.trim(),
      count: Math.min(Math.max(1, count), 200), // Ensure count is between 1 and 200
    };

    try {
      this.logger.debug(`Searching tweets with query: ${query}`);
      
      const response = await firstValueFrom(
        this.httpService.get<TwitterApiResponse<Tweet[]>>(url, {
          headers: this.getHeaders(),
          params,
          timeout: 10000, // 10 seconds timeout
        }),
      );

      this.logger.debug(`Found ${response.data?.data?.length || 0} tweets`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'searchTweets');
    }
  }

  /**
   * Get user profile by username
   * @param username Twitter username (without @)
   * @returns Promise with user profile data
   */
  /**
   * Gets a user's profile by their username
   * @param username - The Twitter username (without @)
   * @returns Promise with user profile data
   * @throws {HttpException} If the request fails or user is not found
   */
  async getUserProfile(username: string): Promise<TwitterApiResponse<UserProfile>> {
    const url = `${this.baseUrl}/twitter/user/by-username`;
    const params = {
      username: username.replace('@', '').trim(),
    };

    try {
      this.logger.debug(`Fetching profile for user: ${username}`);
      
      const response = await firstValueFrom(
        this.httpService.get<TwitterApiResponse<UserProfile>>(url, {
          headers: this.getHeaders(),
          params,
          timeout: 10000, // 10 seconds timeout
        }),
      );

      if (!response.data?.data) {
        throw new HttpException(
          { statusCode: HttpStatus.NOT_FOUND, error: 'Not Found', message: 'User not found' },
          HttpStatus.NOT_FOUND,
        );
      }

      return response.data;
    } catch (error) {
      return this.handleError(error, 'getUserProfile');
    }
  }

  /**
   * Get trending topics
   * @returns Promise with trending topics data
   */
  /**
   * Gets trending topics for a specific location (worldwide by default)
   * @param woeid - Where On Earth ID (1 = worldwide)
   * @returns Promise with trending topics data
   * @throws {HttpException} If the request fails
   */
  async getTrendingTopics(woeid = 1): Promise<TwitterApiResponse<TrendingTopic[]>> {
    const url = `${this.baseUrl}/twitter/trends/place`;
    const params = {
      id: woeid,
    };

    try {
      this.logger.debug(`Fetching trending topics for WOEID: ${woeid}`);
      
      const response = await firstValueFrom(
        this.httpService.get<TwitterApiResponse<TrendingTopic[]>>(url, {
          headers: this.getHeaders(),
          params,
          timeout: 10000, // 10 seconds timeout
        }),
      );

      if (!response.data?.data?.length) {
        this.logger.warn(`No trending topics found for WOEID: ${woeid}`);
      }

      return response.data;
    } catch (error) {
      return this.handleError(error, 'getTrendingTopics');
    }
  }
}
