import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { MarketsService } from './markets.service';
import { Market } from './in-memory-markets.service';
import { BetsService } from '../bets/bets.service';
import { Bet } from '../bets/in-memory-bets.service';

@Controller('markets')
export class MarketsController {
  constructor(
    private readonly marketsService: MarketsService,
    private readonly betsService: BetsService,
  ) {}

  @Get()
  async findAll(): Promise<Market[]> {
    return this.marketsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Market> {
    const market = await this.marketsService.findOne(id);
    if (!market) {
      throw new NotFoundException(`Market with ID ${id} not found`);
    }
    return market;
  }

  @Post()
  async create(@Body() createMarketDto: any): Promise<Market> {
    return this.marketsService.create(createMarketDto);
  }

  @Post(':id/bets')
  async placeBet(
    @Param('id') marketId: string,
    @Body()
    placeBetDto: { outcome: number; amount: number; walletAddress: string },
  ): Promise<Bet> {
    return this.betsService.placeBet({
      ...placeBetDto,
      marketId,
    });
  }
}
