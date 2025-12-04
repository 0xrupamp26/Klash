import { Module, forwardRef } from '@nestjs/common';
import { MarketsController } from './markets.controller';
import { MarketsService } from './markets.service';
import { MarketResolutionService } from './market-resolution.service';
import { InMemoryMarketsService } from './in-memory-markets.service';
import { InMemoryBetsService } from '../bets/in-memory-bets.service';
import { BetsModule } from '../bets/bets.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
    imports: [
        WebsocketModule,
        forwardRef(() => BetsModule),
    ],
    controllers: [MarketsController],
    providers: [
        InMemoryMarketsService,
        InMemoryBetsService,
        MarketsService,
        MarketResolutionService
    ],
    exports: [MarketsService, MarketResolutionService, InMemoryMarketsService, InMemoryBetsService],
})
export class MarketsModule { }
