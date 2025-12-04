import { io, Socket } from 'socket.io-client';

class WebSocketService {
    private socket: Socket | null = null;
    private readonly serverUrl = 'http://localhost:3001';

    connect() {
        if (this.socket?.connected) return;

        this.socket = io(this.serverUrl, {
            transports: ['websocket'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('WebSocket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });

        this.socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinMarket(marketId: string) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }
        this.socket.emit('joinMarket', marketId);
    }

    leaveMarket(marketId: string) {
        if (!this.socket) return;
        this.socket.emit('leaveMarket', marketId);
    }

    onPlayerJoined(callback: (data: any) => void) {
        if (!this.socket) return;
        this.socket.on('playerJoined', callback);
    }

    onMarketStatusChanged(callback: (data: any) => void) {
        if (!this.socket) return;
        this.socket.on('marketStatusChanged', callback);
    }

    onMarketResolved(callback: (data: any) => void) {
        if (!this.socket) return;
        this.socket.on('marketResolved', callback);
    }

    removeAllListeners() {
        if (!this.socket) return;
        this.socket.removeAllListeners();
    }
}

export const websocketService = new WebSocketService();
