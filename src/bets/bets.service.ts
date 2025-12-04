import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InMemoryBetsService, Bet } from './in-memory-bets.service';
import { InMemoryMarketsService } from '../markets/in-memory-markets.service';
import { MarketGateway } from '../websocket/market.gateway';
import { MarketResolutionService } from '../markets/market-resolution.service';

@Injectable()
export class BetsService {
    constructor(
        private readonly inMemoryBetsService: InMemoryBetsService,
        private readonly inMemoryMarketsService: InMemoryMarketsService,
        private marketGateway: MarketGateway,
        private marketResolutionService: MarketResolutionService,
    ) { }

    async placeBet(placeBetDto: {
        marketId: string;
        outcome: number;
        amount: number;
        walletAddress: string;
    }): Promise<Bet> {
        const market = await this.inMemoryMarketsService.findOne(placeBetDto.marketId);

        if (!market) {
            throw new NotFoundException(`Market with ID ${placeBetDto.marketId} not found`);
        }

        // Validate market status
        if (market.status !== 'WAITING_PLAYERS' && market.status !== 'ACTIVE') {
            throw new BadRequestException('Market is not accepting bets');
        }

        // Check if player already bet on this market
        const existingPlayer = market.currentPlayers.find(
            p => p.walletAddress === placeBetDto.walletAddress
        );

        if (existingPlayer) {
            throw new BadRequestException('You have already placed a bet on this market');
        }

        // Check if market is full
        if (market.currentPlayers.length >= market.playerLimit) {
            throw new BadRequestException('Market is full');
        }

        // Calculate odds
        const totalPool = market.pools.total || 0;
        const outcomePool = placeBetDto.outcome === 0 ? market.pools.outcomeA : market.pools.outcomeB;
        const poolRatio = totalPool > 0 ? (totalPool + placeBetDto.amount) / (outcomePool + placeBetDto.amount) : 2;

        // Create bet
        const newBet = await this.inMemoryBetsService.create({
            userId: placeBetDto.walletAddress,
            marketId: placeBetDto.marketId,
            outcome: placeBetDto.outcome,
            amount: placeBetDto.amount,
            odds: poolRatio,
            status: 'PENDING',
            timestamp: new Date(),
        });

        // Update market pools
        market.pools.total += placeBetDto.amount;
        if (placeBetDto.outcome === 0) {
            market.pools.outcomeA += placeBetDto.amount;
        } else {
            market.pools.outcomeB += placeBetDto.amount;
        }

        // Add player to market
        market.currentPlayers.push({
            walletAddress: placeBetDto.walletAddress,
            outcome: placeBetDto.outcome,
            amount: placeBetDto.amount,
            timestamp: new Date(),
        });

        market.totalBets += 1;
        market.uniqueBettors = market.currentPlayers.length;

        await this.inMemoryMarketsService.update(market.marketId, market);

        // Emit player joined event
        this.marketGateway.playerJoined(placeBetDto.marketId, {
            walletAddress: placeBetDto.walletAddress,
            outcome: placeBetDto.outcome,
            amount: placeBetDto.amount,
            currentPlayerCount: market.currentPlayers.length,
            playerLimit: market.playerLimit,
        });

        // Check if market should be activated
        await this.marketResolutionService.checkAndActivateMarket(placeBetDto.marketId);

        return newBet;
    }

    async getUserBets(walletAddress: string): Promise<Bet[]> {
        return this.inMemoryBetsService.findByUser(walletAddress);
    }

    async findOne(betId: string): Promise<Bet> {
        return this.inMemoryBetsService.findOne(betId);
    }
}
