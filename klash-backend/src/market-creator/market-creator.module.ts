import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketCreatorService } from './market-creator.service';
import { Market, MarketSchema } from '../schemas/market.schema';
import { TwitterIOModule } from '../twitterio/twitterio.module';
import { ControversyModule } from '../controversy/controversy.module';
import { AptosModule } from '../aptos/aptos.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Market.name, schema: MarketSchema }]),
    TwitterIOModule,
    ControversyModule,
    AptosModule,
  ],
  providers: [MarketCreatorService],
  exports: [MarketCreatorService],
})
export class MarketCreatorModule {}
