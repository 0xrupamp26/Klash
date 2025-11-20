import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BetsController } from './bets.controller';
import { BetsService } from './bets.service';
import { Bet, BetSchema } from '../schemas/bet.schema';
import { Market, MarketSchema } from '../schemas/market.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Bet.name, schema: BetSchema },
            { name: Market.name, schema: MarketSchema },
        ]),
    ],
    controllers: [BetsController],
    providers: [BetsService],
    exports: [BetsService],
})
export class BetsModule { }
