import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Market, MarketDocument } from '../schemas/market.schema';
import { CreateMarketDto, MarketQueryDto } from './dto/market.dto';

@Injectable()
export class MarketsService {
  private readonly logger = new Logger(MarketsService.name);

  constructor(
    @InjectModel(Market.name) private marketModel: Model<MarketDocument>,
  ) {}

  async getMarkets(query: MarketQueryDto) {
    const { page = 1, limit = 10, status, category } = query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (status) {
      filter.status = status.toUpperCase();
    }
    if (category) {
      filter['metadata.category'] = category;
    }

    // Execute query
    const [markets, total] = await Promise.all([
      this.marketModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.marketModel.countDocuments(filter),
    ]);

    return {
      data: markets.map(market => this.transformMarket(market)),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTrendingMarkets() {
    const markets = await this.marketModel
      .find({ status: 'OPEN' })
      .sort({ 'metadata.controversyScore': -1, 'pools.total': -1 })
      .limit(10)
      .lean();

    return markets.map(market => this.transformMarket(market));
  }

  async getLiveMarkets() {
    const markets = await this.marketModel
      .find({ 
        status: 'OPEN',
        closingTime: { $gt: new Date() }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return markets.map(market => this.transformMarket(market));
  }

  async getEndingSoonMarkets() {
    const markets = await this.marketModel
      .find({ 
        status: 'OPEN',
        closingTime: { 
          $gt: new Date(),
          $lt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
        }
      })
      .sort({ closingTime: 1 })
      .limit(10)
      .lean();

    return markets.map(market => this.transformMarket(market));
  }

  async getMarketById(id: string) {
    const market = await this.marketModel.findById(id).lean();
    
    if (!market) {
      throw new NotFoundException('Market not found');
    }

    return this.transformMarket(market);
  }

  async createMarket(createMarketDto: CreateMarketDto) {
    const market = new this.marketModel({
      ...createMarketDto,
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date(),
      pools: {
        outcomeA: 0,
        outcomeB: 0,
        total: 0,
      },
      metadata: {
        controversyScore: 0,
        category: createMarketDto.category || 'general',
        tags: createMarketDto.tags || [],
      },
    });

    const savedMarket = await market.save();
    return this.transformMarket(savedMarket.toObject());
  }

  private transformMarket(market: any) {
    return {
      marketId: market._id.toString(),
      question: market.question,
      description: market.description,
      outcomes: market.outcomes,
      closingTime: market.closingTime,
      resolutionTime: market.resolutionTime,
      status: market.status,
      pools: market.pools,
      metadata: market.metadata,
      createdAt: market.createdAt,
      updatedAt: market.updatedAt,
    };
  }

  // Helper method to create sample markets for testing
  async createSampleMarkets() {
    const sampleMarkets = [
      {
        question: "Will Elon Musk reply to Mark Zuckerberg's tweet within 24 hours?",
        description: "Market based on Twitter interaction between tech leaders",
        outcomes: ["YES", "NO"],
        closingTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        category: "tech",
        tags: ["twitter", "elon-musk", "mark-zuckerberg"],
      },
      {
        question: "Will Bitcoin price exceed $100,000 by end of this week?",
        description: "Cryptocurrency price prediction market",
        outcomes: ["YES", "NO"],
        closingTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        category: "crypto",
        tags: ["bitcoin", "cryptocurrency", "price"],
      },
      {
        question: "Will a new AI model surpass GPT-4 capabilities this month?",
        description: "AI advancement prediction market",
        outcomes: ["YES", "NO"],
        closingTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        category: "ai",
        tags: ["ai", "gpt", "technology"],
      },
      {
        question: "Will Taylor Swift announce a new album in the next 48 hours?",
        description: "Music industry prediction market",
        outcomes: ["YES", "NO"],
        closingTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        category: "entertainment",
        tags: ["music", "taylor-swift", "album"],
      },
      {
        question: "Will the S&P 500 reach 5,000 points by end of year?",
        description: "Stock market prediction",
        outcomes: ["YES", "NO"],
        closingTime: new Date(new Date().getFullYear(), 11, 31),
        category: "finance",
        tags: ["stocks", "sp500", "finance"],
      },
    ];

    const createdMarkets: any[] = [];
    for (const marketData of sampleMarkets) {
      try {
        // Check if market already exists
        const existing = await this.marketModel.findOne({ 
          question: marketData.question 
        });
        
        if (!existing) {
          const market = new this.marketModel({
            ...marketData,
            status: 'OPEN',
            createdAt: new Date(),
            updatedAt: new Date(),
            pools: {
              outcomeA: Math.floor(Math.random() * 100000),
              outcomeB: Math.floor(Math.random() * 100000),
              total: 0,
            },
            metadata: {
              controversyScore: Math.random() * 0.8 + 0.2, // Random score between 0.2 and 1.0
              category: marketData.category,
              tags: marketData.tags,
            },
          });

          // Calculate total pool
          market.pools.total = market.pools.outcomeA + market.pools.outcomeB;
          
          const savedMarket = await market.save();
          createdMarkets.push(savedMarket.toObject());
        }
      } catch (error) {
        this.logger.error(`Error creating sample market: ${marketData.question}`, error);
      }
    }

    this.logger.log(`Created ${createdMarkets.length} sample markets`);
    return createdMarkets.map((market: any) => this.transformMarket(market));
  }
}
