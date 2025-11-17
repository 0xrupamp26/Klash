import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwitterService } from './twitter.service';
import { TwitterController } from './twitter.controller';
import { Market, MarketSchema } from './schemas/market.schema';
import { TweetAnalysis, TweetAnalysisSchema } from './schemas/tweet-analysis.schema';
import { Controversy, ControversySchema } from './schemas/controversy.schema';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: 5000,
        maxRedirects: 5,
        baseURL: configService.get<string>('twitter.baseUrl'),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Market.name, schema: MarketSchema },
      { name: TweetAnalysis.name, schema: TweetAnalysisSchema },
      { name: Controversy.name, schema: ControversySchema },
    ]),
  ],
  controllers: [TwitterController],
  providers: [TwitterService],
  exports: [TwitterService, MongooseModule],
})
export class TwitterModule {}
