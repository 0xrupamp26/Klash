import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { BetsService } from './bets.service';
import { Bet } from './in-memory-bets.service';

@Controller('bets')
export class BetsController {
    constructor(private readonly betsService: BetsService) { }

    @Post()
    async placeBet(
        @Post()
        async placeBet(
            @Body() placeBetDto: { marketId: string; outcome: number; amount: number; walletAddress: string; transactionHash ?: string },
    ): Promise < Bet > {
    ): Promise<Bet> {
        return this.betsService.placeBet(placeBetDto);
    }

    @Get('user/:userId')
async getUserBets(@Param('userId') userId: string): Promise < Bet[] > {
    return this.betsService.getUserBets(userId);
}

@Get(':id')
async findOne(@Param('id') id: string): Promise < Bet > {
    const bet = await this.betsService.findOne(id);
    if(!bet) {
        throw new NotFoundException(`Bet with ID ${id} not found`);
    }
        return bet;
}
}
