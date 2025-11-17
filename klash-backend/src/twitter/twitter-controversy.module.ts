import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TwitterControversyService } from './twitter-controversy.service';
import { TwitterScheduler } from './twitter.scheduler';
import { TwitterControversyController } from './twitter-controversy.controller';
import { Controversy, ControversySchema } from './schemas/controversy.schema';
import { AptosModule } from '../aptos/aptos.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Controversy.name, schema: ControversySchema },
    ]),
    ScheduleModule.forRoot(),
    forwardRef(() => AptosModule),
  ],
  controllers: [TwitterControversyController],
  providers: [TwitterControversyService, TwitterScheduler],
  exports: [TwitterControversyService],
})
export class TwitterControversyModule {}
