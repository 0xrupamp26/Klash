import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AptosService } from './aptos.service';

@Module({
  imports: [ConfigModule],
  providers: [AptosService],
  exports: [AptosService],
})
export class AptosModule {}
