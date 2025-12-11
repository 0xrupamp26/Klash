import { Module } from '@nestjs/common';
import { MarketGateway } from './market.gateway';

@Module({
  providers: [MarketGateway],
  exports: [MarketGateway],
})
export class WebsocketModule {}
