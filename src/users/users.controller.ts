import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../schemas/user.schema';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    async create(@Body() createUserDto: { walletAddress: string; username?: string; email?: string }): Promise<User> {
        return this.usersService.create(createUserDto);
    }

    @Get(':walletAddress')
    async findByWallet(@Param('walletAddress') walletAddress: string): Promise<User> {
        return this.usersService.findByWallet(walletAddress);
    }
}
