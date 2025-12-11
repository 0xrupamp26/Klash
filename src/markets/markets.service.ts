import { Injectable } from '@nestjs/common';
import { InMemoryMarketsService, Market } from './in-memory-markets.service';

@Injectable()
export class MarketsService {
  constructor(private readonly inMemoryService: InMemoryMarketsService) {}

  async findAll(): Promise<Market[]> {
    return this.inMemoryService.findAll();
  }

  async findOne(marketId: string): Promise<Market> {
    return this.inMemoryService.findOne(marketId);
  }

  async create(createMarketDto: any): Promise<Market> {
    return this.inMemoryService.create(createMarketDto);
  }
}
