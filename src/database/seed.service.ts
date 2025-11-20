import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Market, MarketDocument } from '../schemas/market.schema';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        @InjectModel(Market.name) private marketModel: Model<MarketDocument>,
    ) { }

    async onModuleInit() {
        const count = await this.marketModel.countDocuments();

        if (count === 0) {
            console.log('Seeding database with sample markets...');
            await this.seedMarkets();
        }
    }

    private async seedMarkets() {
        const sampleMarkets = [
            {
                marketId: 'market-1',
                question: 'Will Bitcoin reach $100k by end of 2025?',
                outcomes: ['Yes', 'No'],
                originalTweetId: '1234567890',
                originalTweetText: 'Bitcoin is going to the moon! 🚀',
                originalTweetAuthor: '@CryptoGuru',
                status: 'OPEN',
                closingTime: new Date('2025-12-31'),
                pools: {
                    total: 1000,
                    outcomeA: 600,
                    outcomeB: 400,
                },
                metadata: {
                    category: 'Crypto',
                    tags: ['bitcoin', 'crypto', 'prediction'],
                    controversyScore: 0.85,
                    createdBy: 'system',
                },
                totalBets: 10,
                uniqueBettors: 8,
            },
            {
                marketId: 'market-2',
                question: 'Will AI replace software developers by 2030?',
                outcomes: ['Yes', 'No'],
                originalTweetId: '1234567891',
                originalTweetText: 'AI is coming for all our jobs!',
                originalTweetAuthor: '@TechFuturist',
                status: 'OPEN',
                closingTime: new Date('2030-01-01'),
                pools: {
                    total: 500,
                    outcomeA: 200,
                    outcomeB: 300,
                },
                metadata: {
                    category: 'Technology',
                    tags: ['ai', 'jobs', 'future'],
                    controversyScore: 0.92,
                    createdBy: 'system',
                },
                totalBets: 5,
                uniqueBettors: 5,
            },
            {
                marketId: 'market-3',
                question: 'Will Elon Musk step down as Twitter CEO in 2025?',
                outcomes: ['Yes', 'No'],
                originalTweetId: '1234567892',
                originalTweetText: 'Elon should focus on Tesla and SpaceX!',
                originalTweetAuthor: '@BusinessAnalyst',
                status: 'OPEN',
                closingTime: new Date('2025-12-31'),
                pools: {
                    total: 2000,
                    outcomeA: 1200,
                    outcomeB: 800,
                },
                metadata: {
                    category: 'Business',
                    tags: ['elon', 'twitter', 'ceo'],
                    controversyScore: 0.78,
                    createdBy: 'system',
                },
                totalBets: 15,
                uniqueBettors: 12,
            },
        ];

        await this.marketModel.insertMany(sampleMarkets);
        console.log('Sample markets seeded successfully!');
    }
}
