import { Controller, Get, Post, Param, Body, UseGuards, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ResolutionService, ResolutionResult } from './resolution.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user-role.enum';

@ApiTags('resolution')
@Controller('resolution')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResolutionController {
  constructor(private readonly resolutionService: ResolutionService) {}

  @Post('auto')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Trigger auto-resolution for all pending markets' })
  @ApiResponse({ status: 200, description: 'Auto-resolution completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async triggerAutoResolution() {
    await this.resolutionService.scheduleAutoResolution();
    return { message: 'Auto-resolution process started' };
  }

  @Post(':marketId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Resolve a specific market' })
  @ApiParam({ name: 'marketId', description: 'ID of the market to resolve' })
  @ApiResponse({ status: 200, description: 'Market resolved successfully', type: ResolutionResult })
  @ApiResponse({ status: 400, description: 'Invalid market or resolution failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async resolveMarket(@Param('marketId') marketId: string): Promise<ResolutionResult> {
    return this.resolutionService.resolveMarket(marketId);
  }

  @Post(':marketId/manual')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually resolve a market' })
  @ApiParam({ name: 'marketId', description: 'ID of the market to resolve' })
  @ApiResponse({ status: 200, description: 'Market manually resolved' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async manualResolve(
    @Param('marketId') marketId: string,
    @Body() body: { outcome: number; reason: string },
    @Request() req: any,
  ) {
    await this.resolutionService.manualResolve(
      marketId,
      body.outcome,
      body.reason,
      req.user.walletAddress,
    );
    return { message: 'Market resolved manually' };
  }

  @Get(':marketId/preview')
  @ApiOperation({ summary: 'Preview resolution for a market without saving' })
  @ApiParam({ name: 'marketId', description: 'ID of the market to preview' })
  @ApiResponse({ status: 200, description: 'Resolution preview', type: ResolutionResult })
  @ApiResponse({ status: 400, description: 'Invalid market' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async previewResolution(@Param('marketId') marketId: string): Promise<ResolutionResult> {
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
