import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';
import { MarketCreatorModule } from '../market-creator/market-creator.module';
import { TwitterIOModule } from '../twitterio/twitterio.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Market, MarketSchema } from '../schemas/market.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MarketCreatorModule,
    TwitterIOModule,
    MongooseModule.forFeature([{ name: Market.name, schema: MarketSchema }]),
  ],
  controllers: [CrawlerController],
  providers: [CrawlerService],
  exports: [CrawlerService],
})
export class CrawlerModule {}
