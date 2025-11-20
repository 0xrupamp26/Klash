import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async create(createUserDto: { walletAddress: string; username?: string; email?: string }): Promise<User> {
        const existingUser = await this.userModel.findOne({ walletAddress: createUserDto.walletAddress }).exec();

        if (existingUser) {
            return existingUser;
        }

        const newUser = new this.userModel({
            ...createUserDto,
            role: 'USER',
            stats: {
                totalBets: 0,
                totalWon: 0,
                totalLost: 0,
                totalProfit: 0,
                winRate: 0,
            },
        });

        return newUser.save();
    }

    async findByWallet(walletAddress: string): Promise<User> {
        return this.userModel.findOne({ walletAddress }).exec();
    }
}
