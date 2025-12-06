import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface User {
    userId?: string;
    walletAddress: string;
    username?: string;
    email?: string;
    role: 'USER' | 'ADMIN' | 'MODERATOR';
    stats: {
        totalBets: number;
        totalWon: number;
        totalLost: number;
        totalProfit: number;
        winRate: number;
    };
    createdAt?: Date;
}

@Injectable()
export class InMemoryUsersService {
    private users: Map<string, User> = new Map();

    async create(createUserDto: { walletAddress: string; username?: string; email?: string }): Promise<User> {
        const existingUser = await this.findByWallet(createUserDto.walletAddress);
        if (existingUser) {
            return existingUser;
        }

        const newUser: User = {
            userId: uuidv4(),
            walletAddress: createUserDto.walletAddress,
            username: createUserDto.username,
            email: createUserDto.email,
            role: 'USER',
            stats: {
                totalBets: 0,
                totalWon: 0,
                totalLost: 0,
                totalProfit: 0,
                winRate: 0,
            },
            createdAt: new Date(),
        };

        this.users.set(newUser.walletAddress, newUser);
        return newUser;
    }

    async findByWallet(walletAddress: string): Promise<User | null> {
        return this.users.get(walletAddress) || null;
    }

    async findOne(userId: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.userId === userId) return user;
        }
        return null;
    }
}
