import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:8080'],
        credentials: true,
    },
})
export class MarketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('MarketGateway');

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinMarket')
    handleJoinMarket(client: Socket, marketId: string) {
        client.join(`market_${marketId}`);
        this.logger.log(`Client ${client.id} joined market ${marketId}`);
    }

    @SubscribeMessage('leaveMarket')
    handleLeaveMarket(client: Socket, marketId: string) {
        client.leave(`market_${marketId}`);
        this.logger.log(`Client ${client.id} left market ${marketId}`);
    }

    // Emit to all clients in a specific market
    emitToMarket(marketId: string, event: string, data: any) {
        this.server.to(`market_${marketId}`).emit(event, data);
    }

    // Emit player joined event
    playerJoined(marketId: string, playerData: any) {
        this.emitToMarket(marketId, 'playerJoined', playerData);
    }

    // Emit market status changed
    marketStatusChanged(marketId: string, status: string, data?: any) {
        this.emitToMarket(marketId, 'marketStatusChanged', { status, ...data });
    }

    // Emit market resolved
    marketResolved(marketId: string, resolutionData: any) {
        this.emitToMarket(marketId, 'marketResolved', resolutionData);
    }
}
