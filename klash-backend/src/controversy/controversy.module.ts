import { Module } from '@nestjs/common';
import { ControversyService } from './controversy.service';

@Module({
  providers: [ControversyService],
  exports: [ControversyService],
})
export class ControversyModule {}
