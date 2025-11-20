import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TwitterAiService } from './twitter-ai.service';
import { TwitterAiController } from './twitter-ai.controller';
import { TwitterAiScheduler } from './twitter-ai.scheduler';

@Module({
    imports: [HttpModule],
    controllers: [TwitterAiController],
    providers: [TwitterAiService, TwitterAiScheduler],
    exports: [TwitterAiService],
})
export class TwitterAiModule { }
