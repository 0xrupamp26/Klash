import { Controller, Get, Post, Param, Body, Query, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MarketsService } from './markets.service';
import { CreateMarketDto, MarketResponseDto, MarketListResponseDto, MarketQueryDto, MarketStatus } from './dto/market.dto';

@ApiTags('markets')
@Controller('markets')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all markets' })
  @ApiResponse({ status: 200, description: 'Markets retrieved successfully', type: MarketListResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'CLOSED', 'RESOLVED'], description: 'Filter by market status' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter by category' })
  async getMarkets(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: MarketStatus,
    @Query('category') category?: string,
  ): Promise<MarketListResponseDto> {
    try {
      const markets = await this.marketsService.getMarkets({
        page: Number(page),
        limit: Number(limit),
        status: status as MarketStatus,
        category,
      });
      
      return {
        success: true,
        data: markets.data,
        pagination: {
          page: markets.page,
          limit: markets.limit,
          total: markets.total,
          totalPages: markets.totalPages,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch markets',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending markets' })
  @ApiResponse({ status: 200, description: 'Trending markets retrieved successfully', type: MarketListResponseDto })
  async getTrendingMarkets(): Promise<MarketListResponseDto> {
    try {
      const markets = await this.marketsService.getTrendingMarkets();
      
      return {
        success: true,
        data: markets,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch trending markets',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('live')
  @ApiOperation({ summary: 'Get live markets' })
  @ApiResponse({ status: 200, description: 'Live markets retrieved successfully', type: MarketListResponseDto })
  async getLiveMarkets(): Promise<MarketListResponseDto> {
    try {
      const markets = await this.marketsService.getLiveMarkets();
      
      return {
        success: true,
        data: markets,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch live markets',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('ending-soon')
  @ApiOperation({ summary: 'Get markets ending soon' })
  @ApiResponse({ status: 200, description: 'Markets ending soon retrieved successfully', type: MarketListResponseDto })
  async getEndingSoonMarkets(): Promise<MarketListResponseDto> {
    try {
      const markets = await this.marketsService.getEndingSoonMarkets();
      
      return {
        success: true,
        data: markets,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch markets ending soon',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get market by ID' })
  @ApiResponse({ status: 200, description: 'Market retrieved successfully', type: MarketResponseDto })
  @ApiResponse({ status: 404, description: 'Market not found' })
  @ApiParam({ name: 'id', description: 'Market ID' })
  async getMarket(@Param('id') id: string): Promise<MarketResponseDto> {
    try {
      const market = await this.marketsService.getMarketById(id);
      
      if (!market) {
        throw new HttpException(
          {
            success: false,
            message: 'Market not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      
      return {
        success: true,
        data: market,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch market',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed sample markets for testing' })
  @ApiResponse({ status: 201, description: 'Sample markets created successfully' })
  async seedSampleMarkets(): Promise<MarketListResponseDto> {
    try {
      const markets = await this.marketsService.createSampleMarkets();
      
      return {
        success: true,
        data: markets,
        message: 'Sample markets created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to seed sample markets',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new market' })
  @ApiResponse({ status: 201, description: 'Market created successfully', type: MarketResponseDto })
  async createMarket(@Body() createMarketDto: CreateMarketDto): Promise<MarketResponseDto> {
    try {
      const market = await this.marketsService.createMarket(createMarketDto);
      
      return {
        success: true,
        data: market,
        message: 'Market created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create market',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
