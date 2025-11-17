import { Module } from '@nestjs/common';
import { AllocationService } from './allocation.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AllocationService],
  exports: [AllocationService],
})
export class AllocationModule {}
