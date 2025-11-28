import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketsController } from './markets.controller';
import { MarketsService } from './markets.service';
import { Market, MarketSchema } from '../schemas/market.schema';
import { BetsModule } from '../bets/bets.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Market.name, schema: MarketSchema }]),
        BetsModule,
    ],
    controllers: [MarketsController],
    providers: [MarketsService],
    exports: [MarketsService],
})
export class MarketsModule { }
