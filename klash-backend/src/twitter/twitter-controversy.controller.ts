import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Query, 
  Body, 
  UsePipes, 
  ValidationPipe, 
  HttpStatus, 
  HttpException,
  Delete
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TwitterControversyService } from './twitter-controversy.service';
import { 
  CreateControversyDto, 
  SearchControversiesDto, 
  AnalyzeSentimentDto, 
  ResolveMarketDto 
} from './dto/controversy.dto';
import { Controversy } from './schemas/controversy.schema';

@ApiTags('twitter-controversy')
@Controller('twitter/controversy')
export class TwitterControversyController {
  constructor(private readonly twitterService: TwitterControversyService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search for controversial tweets' })
  @ApiQuery({ name: 'query', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of controversial tweets' })
  async searchControversies(
    @Query('query') query: string,
    @Query('limit') limit = 50
  ) {
    try {
      return await this.twitterService.searchControversies(query, limit);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('influencer/:username')
  @ApiOperation({ summary: 'Monitor a specific influencer for controversies' })
  @ApiParam({ name: 'username', type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of controversial tweets from the influencer' })
  async monitorInfluencer(
    @Param('username') username: string,
    @Query('limit') limit = 20
  ) {
    try {
      return await this.twitterService.monitorInfluencer(username, limit);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze sentiment for a tweet and its replies' })
  @ApiResponse({ status: 200, description: 'Sentiment analysis results' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async analyzeSentiment(@Body() dto: AnalyzeSentimentDto) {
    try {
      return await this.twitterService.analyzeSentiment(dto.tweetId, dto.maxReplies);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('market/resolve')
  @ApiOperation({ summary: 'Resolve a prediction market based on sentiment analysis' })
  @ApiResponse({ status: 200, description: 'Market resolution result' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async resolveMarket(@Body() dto: ResolveMarketDto) {
    try {
      return await this.twitterService.resolveMarket(dto.marketId, dto.tweetId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('controversies')
  @ApiOperation({ summary: 'List all controversies with optional filters' })
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({ name: 'author', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: [String] })
  @ApiQuery({ name: 'minScore', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of controversies' })
  async getControversies(@Query() query: SearchControversiesDto) {
    try {
      return await this.twitterService.findAll(query);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('controversy/:id')
  @ApiOperation({ summary: 'Get a specific controversy by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Controversy details' })
  async getControversy(@Param('id') id: string) {
    try {
      const controversy = await this.twitterService.findById(id);
      if (!controversy) {
        throw new HttpException('Controversy not found', HttpStatus.NOT_FOUND);
      }
      return controversy;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('controversy/:id')
  @ApiOperation({ summary: 'Delete a controversy' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Controversy deleted successfully' })
  async deleteControversy(@Param('id') id: string) {
    try {
      const result = await this.twitterService.deleteControversy(id);
      if (!result) {
        throw new HttpException('Controversy not found', HttpStatus.NOT_FOUND);
      }
      return { success: true, message: 'Controversy deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('market/auto-create')
  @ApiOperation({ summary: 'Manually trigger market creation for high-scoring controversies' })
  @ApiResponse({ status: 200, description: 'Markets created successfully' })
  async autoCreateMarkets() {
    try {
      const results = await this.twitterService.autoCreateMarkets();
      return {
        success: true,
        message: `Created ${results.length} new markets`,
        markets: results
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
