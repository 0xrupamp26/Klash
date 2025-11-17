import { Controller, Get, Post, Param, Body, HttpException, HttpStatus, Query, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ResolutionService } from './resolution.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@ApiTags('resolution')
@Controller('resolution')
export class ResolutionController {
  constructor(private readonly resolutionService: ResolutionService) {}

  @Post('auto')
  @ApiOperation({ summary: 'Trigger auto-resolution for all pending markets' })
  @ApiResponse({ status: 200, description: 'Auto-resolution triggered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async triggerAutoResolution(): Promise<any> {
    await this.resolutionService.scheduleAutoResolution();
    return { message: 'Auto-resolution process started' };
  }

  @Post(':marketId')
  @ApiOperation({ summary: 'Resolve a specific market' })
  @ApiParam({ name: 'marketId', description: 'ID of the market to resolve' })
  @ApiResponse({ status: 200, description: 'Market resolved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid market or resolution failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async resolveMarket(
    @Param('marketId') marketId: string,
    @Body() body: any,
  ): Promise<any> {
    return this.resolutionService.resolveMarket(marketId);
  }

  @Post(':marketId/manual')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually resolve a market' })
  @ApiParam({ name: 'marketId', description: 'ID of the market to resolve' })
  @ApiResponse({ status: 200, description: 'Market manually resolved' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async manualResolveMarket(
    @Param('marketId') marketId: string,
    @Body() body: { outcome: number; evidence?: string; reason?: string },
  ): Promise<any> {
    await this.resolutionService.manualResolve(
      marketId,
      body.outcome,
      body.reason || body.evidence || 'Manual resolution',
      'admin', // Hardcoded for now since auth is removed
    );
    return { message: 'Market resolved manually' };
  }

  @Get(':marketId/preview')
  @ApiOperation({ summary: 'Preview resolution for a market' })
  @ApiParam({ name: 'marketId', description: 'ID of the market to preview' })
  @ApiResponse({ status: 200, description: 'Resolution preview' })
  @ApiResponse({ status: 400, description: 'Invalid market' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async previewResolution(@Param('marketId') marketId: string): Promise<any> {
    // Clone the resolveMarket method but don't save changes
    const market = await this.resolutionService['marketModel'].findOne({ marketId });
    if (!market) {
      throw new Error('Market not found');
    }

    const analysis = await this.resolutionService['analyzeReplies'](
      market.originalTweetId,
      market.question,
      market.outcomes,
    );

    return this.resolutionService['determineWinner'](
      analysis.sentimentResults,
      analysis.teamResults,
      market,
    );
  }

  @Get('pending')
  @ApiOperation({ summary: 'List markets pending resolution' })
  @ApiResponse({ status: 200, description: 'List of pending markets' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPendingMarkets(
    @Query('status') status?: string,
    @Query('before') before?: string,
  ) {
    const query: any = {
      status: 'OPEN',
      closingTime: { $lt: new Date() },
    };

    if (status) {
      query.status = status;
    }

    if (before) {
      query.closingTime.$lt = new Date(before);
    }

    return this.resolutionService['marketModel']
      .find(query)
      .sort({ closingTime: 1 })
      .limit(50);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recently resolved markets' })
  @ApiResponse({ status: 200, description: 'List of recently resolved markets' })
  async getRecentResolutions(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    return this.resolutionService['marketModel']
      .find({ status: 'RESOLVED' })
      .sort({ resolutionTime: -1 })
      .skip(offset)
      .limit(limit);
  }
}
