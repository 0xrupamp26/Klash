import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TwitterAiService } from './twitter-ai.service';
import { TwitterAiController } from './twitter-ai.controller';
import { TwitterAiScheduler } from './twitter-ai.scheduler';

import { MarketsModule } from '../markets/markets.module';

@Module({
  imports: [HttpModule, MarketsModule],
  controllers: [TwitterAiController],
  providers: [TwitterAiService, TwitterAiScheduler],
  exports: [TwitterAiService],
})
export class TwitterAiModule {}
