import { Module } from '@nestjs/common';
import { TwitterIOService } from './twitterio.service';

@Module({
  providers: [TwitterIOService],
  exports: [TwitterIOService],
})
export class TwitterIOModule {}
