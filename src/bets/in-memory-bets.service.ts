import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InMemoryMarketsService } from '../markets/in-memory-markets.service';
import { MarketResolutionService } from '../markets/market-resolution.service';

export interface Bet {
    betId: string;
    userId: string;
    marketId: string;
    outcome: number;
    amount: number;
    odds: number;
    status: string;
    payout?: number;
    timestamp: Date;
    walletAddress?: string;
    profit?: number;
    transactionHash?: string;
    resolvedAt?: Date;
    paidAt?: Date;
}

@Injectable()
export class InMemoryBetsService {
    private bets: Map<string, Bet> = new Map();

    constructor(
        @Inject(forwardRef(() => InMemoryMarketsService))
        private marketsService: InMemoryMarketsService,
        @Inject(forwardRef(() => MarketResolutionService))
        private resolutionService: MarketResolutionService,
    ) { }

    async findAll(): Promise<Bet[]> {
        return Array.from(this.bets.values());
    }

    async findOne(betId: string): Promise<Bet | null> {
        return this.bets.get(betId) || null;
    }

    async findByMarket(marketId: string): Promise<Bet[]> {
        return Array.from(this.bets.values()).filter(bet => bet.marketId === marketId);
    }

    async findByUser(userId: string): Promise<Bet[]> {
        return Array.from(this.bets.values()).filter(bet => bet.userId === userId);
    }

    async create(betData: Partial<Bet>): Promise<Bet> {
        const market = await this.marketsService.findOne(betData.marketId || '');
        if (!market) {
            throw new Error('Market not found');
        }

        const bet: Bet = {
            betId: betData.betId || uuidv4(),
            userId: betData.userId || '',
            marketId: betData.marketId || '',
            outcome: betData.outcome || 0,
            amount: betData.amount || 0,
            odds: betData.odds || 1,
            status: betData.status || 'PENDING',
            payout: betData.payout,
            timestamp: betData.timestamp || new Date(),
            walletAddress: betData.walletAddress,
            transactionHash: betData.transactionHash,
            resolvedAt: betData.resolvedAt,
            paidAt: betData.paidAt
        };

        this.bets.set(bet.betId, bet);

        // Update Market Stats
        market.pools.total += bet.amount;
        if (bet.outcome === 0) market.pools.outcomeA += bet.amount;
        else market.pools.outcomeB += bet.amount;

        market.totalBets += 1;

        // Add player if unique
        const existingPlayer = market.currentPlayers.find(p => p.walletAddress === bet.walletAddress);
        if (!existingPlayer) {
            market.currentPlayers.push({
                walletAddress: bet.walletAddress || 'unknown',
                outcome: bet.outcome,
                amount: bet.amount,
                timestamp: new Date()
            });
            market.uniqueBettors += 1;
        }

        await this.marketsService.update(market.marketId, market);

        // Check for activation
        await this.resolutionService.checkAndActivateMarket(market.marketId);

        return bet;
    }

    async update(betId: string, updates: Partial<Bet>): Promise<Bet | null> {
        const bet = this.bets.get(betId);
        if (!bet) return null;

        const updated = { ...bet, ...updates };
        this.bets.set(betId, updated);
        return updated;
    }
}
