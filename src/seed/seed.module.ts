import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { MarketsModule } from '../markets/markets.module';

@Module({
  imports: [MarketsModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
