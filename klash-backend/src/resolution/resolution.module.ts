import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ResolutionService } from './resolution.service';
import { ResolutionController } from './resolution.controller';
import { TwitterModule } from '../twitter/twitter.module';
import { AllocationModule } from '../allocation/allocation.module';

// Import schemas
import { Market, MarketSchema } from '../schemas/market.schema';
import { Bet, BetSchema } from '../schemas/bet.schema';
import { TweetAnalysis, TweetAnalysisSchema } from '../schemas/tweet-analysis.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Market.name, schema: MarketSchema },
      { name: Bet.name, schema: BetSchema },
      { name: TweetAnalysis.name, schema: TweetAnalysisSchema },
    ]),
    ScheduleModule.forRoot(),
    TwitterModule,
    AllocationModule,
  ],
  controllers: [ResolutionController],
  providers: [ResolutionService],
  exports: [ResolutionService],
})
export class ResolutionModule {}
