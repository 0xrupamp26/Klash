import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { MarketsModule } from './markets/markets.module';
import { BetsModule } from './bets/bets.module';
import { UsersModule } from './users/users.module';
import { TwitterAiModule } from './twitter-ai/twitter-ai.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    MarketsModule,
    BetsModule,
    UsersModule,
    TwitterAiModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
