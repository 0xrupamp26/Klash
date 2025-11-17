import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TwitterModule } from './twitter/twitter.module';
import { TwitterControversyModule } from './twitter/twitter-controversy.module';
import { AptosModule } from './aptos/aptos.module';
import { MarketsModule } from './markets/markets.module';
import { CrawlerModule } from './crawler/crawler.module';
import { TwitterIOModule } from './twitterio/twitterio.module';
import { ControversyModule } from './controversy/controversy.module';
import { MarketCreatorModule } from './market-creator/market-creator.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost/klash',
      }),
      inject: [ConfigService],
    }),
    TwitterModule,
    TwitterControversyModule,
    AptosModule,
    MarketsModule,
    CrawlerModule,
    TwitterIOModule,
    ControversyModule,
    MarketCreatorModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})
export class AppModule {}
