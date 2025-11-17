import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UsePipes, 
  ValidationPipe, 
  HttpStatus,
  Query,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery, 
  ApiParam, 
  ApiBody,
} from '@nestjs/swagger';
import { TwitterService } from './twitter.service';
import { SearchTweetsDto } from './dto/search-tweets.dto';
import { GetUserDto } from './dto/get-user.dto';
import { 
  SentimentResult, 
  TeamClassificationResult, 
  MarketResolutionResult 
} from './twitter.service';

@ApiTags('Twitter')
@Controller('twitter')
export class TwitterController {
  private readonly logger = new Logger(TwitterController.name);

  constructor(private readonly twitterService: TwitterService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search for tweets' })
  @ApiResponse({ status: 200, description: 'Returns matching tweets' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(new ValidationPipe({ transform: true }))
  searchTweets(@Query() searchTweetsDto: SearchTweetsDto) {
    return this.twitterService.searchTweets(searchTweetsDto.query, searchTweetsDto.count);
  }

  @Get('user/:username')
  @ApiOperation({ summary: 'Get user profile by username' })
  @ApiParam({ name: 'username', description: 'Twitter username (without @)' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ValidationPipe({ transform: true }))
  getUserProfile(@Param() getUserDto: GetUserDto) {
    return this.twitterService.getUserProfile(getUserDto.username);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get trending topics' })
  @ApiResponse({ status: 200, description: 'Returns trending topics' })
  getTrendingTopics() {
    return this.twitterService.getTrendingTopics();
  }

  @Post('analyze-sentiment')
  @ApiOperation({ summary: 'Analyze sentiment of tweets using Hugging Face model' })
  @ApiBody({ 
    description: 'Array of tweets to analyze',
    schema: {
      type: 'object',
      properties: {
        tweets: { 
          type: 'array',
          items: { type: 'object' },
          description: 'Array of tweet objects to analyze'
        }
      },
      required: ['tweets']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Returns sentiment analysis results',
    type: SentimentResult
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async analyzeSentiment(@Body() body: { tweets: any[] }): Promise<SentimentResult> {
    try {
      return await this.twitterService.analyzeSentimentHF(body.tweets);
    } catch (error) {
      this.logger.error(`Sentiment analysis failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('classify-teams')
  @ApiOperation({ summary: 'Classify tweets into teams based on a controversy' })
  @ApiBody({
    description: 'Controversy, teams, and tweets for classification',
    schema: {
      type: 'object',
      properties: {
        controversy: { type: 'string', description: 'The controversy description' },
        teams: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Array of team names to classify into'
        },
        tweets: { 
          type: 'array',
          items: { type: 'object' },
          description: 'Array of tweet objects to classify'
        }
      },
      required: ['controversy', 'teams', 'tweets']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Returns team classification results',
    type: TeamClassificationResult
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async classifyTweets(
    @Body() body: { controversy: string; teams: string[]; tweets: any[] },
  ): Promise<TeamClassificationResult> {
    try {
      const { controversy, teams, tweets } = body;
      return await this.twitterService.classifyTeams(controversy, tweets, teams);
    } catch (error) {
      this.logger.error(`Team classification failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('resolve/:marketId')
  @ApiOperation({ summary: 'Resolve a prediction market' })
  @ApiParam({ 
    name: 'marketId', 
    description: 'ID of the market to resolve' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Returns market resolution results',
    type: MarketResolutionResult
  })
  @ApiResponse({ status: 404, description: 'Market not found' })
  @ApiResponse({ status: 400, description: 'Market already resolved' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async resolveMarket(
    @Param('marketId') marketId: string,
  ): Promise<MarketResolutionResult> {
    try {
      return await this.twitterService.resolveMarket(marketId);
    } catch (error) {
      this.logger.error(`Market resolution failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('auto-resolve-markets')
  @ApiOperation({ 
    summary: 'Trigger resolution of all expired markets',
    description: 'Resolves all markets that have passed their closing time'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully processed all expired markets',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        resolved: { type: 'number' },
        failed: { type: 'number' }
      }
    }
  })
  async autoResolveMarkets(): Promise<{ message: string; resolved: number; failed: number }> {
    try {
      await this.twitterService.autoResolveExpiredMarkets();
      return { 
        message: 'Auto-resolution of markets completed',
        resolved: 0, // You might want to track these in the service
        failed: 0
      };
    } catch (error) {
      this.logger.error(`Auto-resolve markets failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
