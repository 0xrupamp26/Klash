import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check if the API is running' })
  @ApiResponse({ status: 200, description: 'API is running' })
  getHealth(): { status: string } {
    return this.appService.getHealth();
  }
}
