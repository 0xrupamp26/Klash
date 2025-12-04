import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MarketsModule } from './markets/markets.module';
import { BetsModule } from './bets/bets.module';
import { UsersModule } from './users/users.module';
import { TwitterAiModule } from './twitter-ai/twitter-ai.module';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    MarketsModule,
    BetsModule,
    UsersModule,
    TwitterAiModule,
    AuthModule,
    SeedModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
