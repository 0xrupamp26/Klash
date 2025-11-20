import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Market, MarketDocument } from '../schemas/market.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MarketsService {
    constructor(
        @InjectModel(Market.name) private marketModel: Model<MarketDocument>,
    ) { }

    async findAll(): Promise<Market[]> {
        return this.marketModel.find().exec();
    }

    async findOne(marketId: string): Promise<Market> {
        return this.marketModel.findOne({ marketId }).exec();
    }

    async create(createMarketDto: any): Promise<Market> {
        const newMarket = new this.marketModel({
            ...createMarketDto,
            marketId: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return newMarket.save();
    }
}
