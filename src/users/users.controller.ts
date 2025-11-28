import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../schemas/user.schema';
import { BetsService } from '../bets/bets.service';
import { Bet } from '../schemas/bet.schema';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly betsService: BetsService,
    ) { }

    @Post()
    async create(@Body() createUserDto: { walletAddress: string; username?: string; email?: string }): Promise<User> {
        return this.usersService.create(createUserDto);
    }

    @Get(':walletAddress')
    async findByWallet(@Param('walletAddress') walletAddress: string): Promise<User> {
        return this.usersService.findByWallet(walletAddress);
    }

    @Get(':walletAddress/bets')
    async getUserBets(@Param('walletAddress') walletAddress: string): Promise<Bet[]> {
        return this.betsService.getUserBets(walletAddress);
    }
}
