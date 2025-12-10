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

    // Helper for Controller
    async placeBet(betData: any): Promise<Bet> {
        return this.create(betData);
    }

    async getUserBets(userId: string): Promise<Bet[]> {
        return this.findByUser(userId);
    }

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

    async getPortfolio(walletAddress: string): Promise<{ open: Bet[], history: Bet[] }> {
        const userBets = Array.from(this.bets.values()).filter(b => b.walletAddress === walletAddress);
        const open = userBets.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'WAITING_FOR_SECOND');
        const history = userBets.filter(b => b.status === 'WON' || b.status === 'LOST' || b.status === 'REFUNDED');
        return { open, history };
    }

    async create(betData: Partial<Bet>): Promise<Bet> {
        // 1. Idempotency Check
        if (betData.transactionHash) {
            const existing = Array.from(this.bets.values()).find(b => b.transactionHash === betData.transactionHash);
            if (existing) {
                console.log(`Idempotency check: Bet for hash ${betData.transactionHash} already exists.`);
                return existing;
            }
        }

        const market = await this.marketsService.findOne(betData.marketId || '');
        if (!market) {
            throw new Error('Market not found');
        }

        // 2. Validate Alpha State Machine
        if (market.status === 'LOCKED' || market.status === 'RESOLVED') {
            throw new Error('Market is locked or resolved. No new bets allowed.');
        }

        // 3. Create Bet
        const bet: Bet = {
            betId: betData.betId || uuidv4(),
            userId: betData.userId || '',
            marketId: betData.marketId || '',
            outcome: betData.outcome || 0,
            amount: betData.amount || 0,
            odds: betData.odds || 1,
            status: 'CONFIRMED',
            payout: 0,
            timestamp: new Date(),
            walletAddress: betData.walletAddress,
            transactionHash: betData.transactionHash,
        };

        this.bets.set(bet.betId, bet);

        // 4. Update Market Pools
        market.pools.total += bet.amount;
        if (bet.outcome === 0) market.pools.outcomeA += bet.amount;
        else market.pools.outcomeB += bet.amount;
        market.totalBets += 1;

        // 5. Update Players & State
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

        // State Machine Logic for 2-Player Alpha
        if (market.currentPlayers.length === 1) {
            market.status = 'WAITING_FOR_SECOND'; // 1 player waiting
        } else if (market.currentPlayers.length >= 2) {
            market.status = 'LOCKED'; // 2 players joined, lock it
            // Trigger resolution shortly
            setTimeout(() => this.resolutionService.resolveMarket(market.marketId), 2000);
        }

        await this.marketsService.update(market.marketId, market);
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
