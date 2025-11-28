import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    async login(walletAddress: string) {
        let user = await this.usersService.findByWallet(walletAddress);
        if (!user) {
            // Auto-register if not found, for simplicity
            user = await this.usersService.create({ walletAddress });
        }

        // Return a simple token (just the wallet address encoded or a mock string for now)
        // In a real app, use @nestjs/jwt
        return {
            token: `mock-jwt-token-${walletAddress}`,
            user,
        };
    }

    async register(registerDto: { walletAddress: string; username?: string; email?: string }) {
        const user = await this.usersService.create(registerDto);
        return {
            token: `mock-jwt-token-${user.walletAddress}`,
            user,
        };
    }
}
