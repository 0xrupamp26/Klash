import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

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
}

@Injectable()
export class InMemoryBetsService {
    private bets: Map<string, Bet> = new Map();

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
        const bet: Bet = {
            betId: betData.betId || uuidv4(),
            userId: betData.userId || '',
            marketId: betData.marketId || '',
            outcome: betData.outcome || 0,
            amount: betData.amount || 0,
            odds: betData.odds || 1,
            status: betData.status || 'PENDING',
            payout: betData.payout,
            timestamp: betData.timestamp || new Date()
        };

        this.bets.set(bet.betId, bet);
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
