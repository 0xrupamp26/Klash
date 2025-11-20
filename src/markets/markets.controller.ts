import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { Market } from '../schemas/market.schema';

@Controller('markets')
export class MarketsController {
    constructor(private readonly marketsService: MarketsService) { }

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
}
