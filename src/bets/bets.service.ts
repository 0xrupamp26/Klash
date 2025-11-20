import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bet, BetDocument } from '../schemas/bet.schema';
import { Market, MarketDocument } from '../schemas/market.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BetsService {
    constructor(
        @InjectModel(Bet.name) private betModel: Model<BetDocument>,
        @InjectModel(Market.name) private marketModel: Model<MarketDocument>,
    ) { }

    async placeBet(placeBetDto: {
        marketId: string;
        outcome: number;
        amount: number;
        walletAddress: string;
    }): Promise<Bet> {
        const market = await this.marketModel.findOne({ marketId: placeBetDto.marketId }).exec();

        if (!market) {
            throw new NotFoundException(`Market with ID ${placeBetDto.marketId} not found`);
        }

        if (market.status !== 'OPEN') {
            throw new Error('Market is not open for betting');
        }

        // Calculate odds based on current pool
        const totalPool = market.pools.total || 0;
        const outcomePool = placeBetDto.outcome === 0 ? market.pools.outcomeA : market.pools.outcomeB;
        const poolRatio = totalPool > 0 ? (totalPool + placeBetDto.amount) / (outcomePool + placeBetDto.amount) : 2;

        const newBet = new this.betModel({
            betId: uuidv4(),
            userId: placeBetDto.walletAddress, // Using wallet address as userId for now
            marketId: placeBetDto.marketId,
            outcome: placeBetDto.outcome,
            amount: placeBetDto.amount,
            walletAddress: placeBetDto.walletAddress,
            status: 'ACTIVE',
            odds: {
                atPlacement: poolRatio,
                poolRatio: poolRatio,
            },
        });

        // Update market pools
        market.pools.total += placeBetDto.amount;
        if (placeBetDto.outcome === 0) {
            market.pools.outcomeA += placeBetDto.amount;
        } else {
            market.pools.outcomeB += placeBetDto.amount;
        }
        market.totalBets += 1;

        await market.save();
        return newBet.save();
    }

    async getUserBets(userId: string): Promise<Bet[]> {
        return this.betModel.find({ userId }).exec();
    }

    async findOne(betId: string): Promise<Bet> {
        return this.betModel.findOne({ betId }).exec();
    }
}
