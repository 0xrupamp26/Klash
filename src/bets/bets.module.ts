import { Module, forwardRef } from '@nestjs/common';
import { BetsController } from './bets.controller';
import { BetsService } from './bets.service';
import { InMemoryBetsService } from './in-memory-bets.service'; // Import this
import { InMemoryMarketsService } from '../markets/in-memory-markets.service'; // Import this
import { WebsocketModule } from '../websocket/websocket.module';
import { MarketsModule } from '../markets/markets.module';

@Module({
  imports: [WebsocketModule, forwardRef(() => MarketsModule)],
  controllers: [BetsController],
  providers: [
    {
      provide: BetsService,
      useClass: InMemoryBetsService,
    },
    InMemoryBetsService,
  ],
  exports: [BetsService],
})
export class BetsModule {}
