import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Market {
    marketId: string;
    question: string;
    outcomes: string[];
    originalTweetId?: string;
    originalTweetText?: string;
    originalTweetAuthor?: string;
    status: string;
    marketType: string;
    playerLimit: number;
    currentPlayers: Array<{
        walletAddress: string;
        outcome: number;
        amount: number;
        timestamp: Date;
    }>;
    platformFeePercent: number;
    closingTime: Date;
    resolutionTime: Date;
    winningOutcome?: number;
    pools: {
        total: number;
        outcomeA: number;
        outcomeB: number;
    };
    metadata: {
        category: string;
        tags: string[];
        controversyScore: number;
        createdBy: string;
        tweetUrl?: string;
        description?: string;
    };
    totalBets: number;
    uniqueBettors: number;
}

@Injectable()
export class InMemoryMarketsService {
    private markets: Map<string, Market> = new Map();

    constructor() {
        // Seed initial market
        this.seedMarket();
    }

    private seedMarket() {
        const market: Market = {
            marketId: uuidv4(),
            question: 'Will this controversial tweet spark a major debate?',
            outcomes: ['Yes', 'No'],
            originalTweetId: '1995887135661126136',
            originalTweetText: 'Controversial content from @BR4ted',
            originalTweetAuthor: 'BR4ted',
            status: 'WAITING_PLAYERS',
            marketType: 'TWO_PLAYER',
            playerLimit: 2,
            closingTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            resolutionTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
            pools: { total: 0, outcomeA: 0, outcomeB: 0 },
            platformFeePercent: 2,
            currentPlayers: [],
            metadata: {
                category: 'Social',
                tags: ['twitter', 'controversy', 'debate'],
                controversyScore: 0.95,
                createdBy: 'SEED',
                tweetUrl: 'https://x.com/BR4ted/status/1995887135661126136?s=20',
                description: 'Based on the controversial tweet from @BR4ted. Will this spark a major debate in the community?'
            },
            totalBets: 0,
            uniqueBettors: 0
        };

        this.markets.set(market.marketId, market);
    }

    async findAll(): Promise<Market[]> {
        return Array.from(this.markets.values());
    }

    async findOne(marketId: string): Promise<Market | null> {
        return this.markets.get(marketId) || null;
    }

    async create(marketData: Partial<Market>): Promise<Market> {
        const market: Market = {
            marketId: marketData.marketId || uuidv4(),
            question: marketData.question || '',
            outcomes: marketData.outcomes || ['Yes', 'No'],
            originalTweetId: marketData.originalTweetId,
            originalTweetText: marketData.originalTweetText,
            originalTweetAuthor: marketData.originalTweetAuthor,
            status: marketData.status || 'WAITING_PLAYERS',
            marketType: marketData.marketType || 'TWO_PLAYER',
            playerLimit: marketData.playerLimit || 2,
            currentPlayers: marketData.currentPlayers || [],
            platformFeePercent: marketData.platformFeePercent || 2,
            closingTime: marketData.closingTime || new Date(),
            resolutionTime: marketData.resolutionTime || new Date(),
            pools: marketData.pools || { total: 0, outcomeA: 0, outcomeB: 0 },
            metadata: marketData.metadata || {
                category: 'General',
                tags: [],
                controversyScore: 0,
                createdBy: 'USER'
            },
            totalBets: marketData.totalBets || 0,
            uniqueBettors: marketData.uniqueBettors || 0
        };

        this.markets.set(market.marketId, market);
        return market;
    }

    async update(marketId: string, updates: Partial<Market>): Promise<Market | null> {
        const market = this.markets.get(marketId);
        if (!market) return null;

        const updated = { ...market, ...updates };
        this.markets.set(marketId, updated);
        return updated;
    }
}
