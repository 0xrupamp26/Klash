import { Module, forwardRef } from '@nestjs/common';
import { BetsController } from './bets.controller';
import { BetsService } from './bets.service';
import { WebsocketModule } from '../websocket/websocket.module';
import { MarketsModule } from '../markets/markets.module';

@Module({
    imports: [
        WebsocketModule,
        forwardRef(() => MarketsModule),
    ],
    controllers: [BetsController],
    providers: [BetsService],
    exports: [BetsService],
})
export class BetsModule { }
