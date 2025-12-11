import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { walletAddress: string }) {
    return this.authService.login(loginDto.walletAddress);
  }

  @Post('register')
  async register(
    @Body()
    registerDto: {
      walletAddress: string;
      username?: string;
      email?: string;
    },
  ) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    // For now, just return a mock profile or extract from token if we implemented full JWT
    // Since requirements said "simple JWT or wallet-based auth", we'll keep it simple
    return { message: 'Profile endpoint' };
  }
}
