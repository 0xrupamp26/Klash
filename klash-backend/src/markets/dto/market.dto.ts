import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsDateString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export enum MarketStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  RESOLVED = 'RESOLVED',
}

export class CreateMarketDto {
  @ApiProperty({ description: 'The market question' })
  @IsString()
  question: string;

  @ApiPropertyOptional({ description: 'Detailed description of the market' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Array of possible outcomes', example: ['YES', 'NO'] })
  @IsArray()
  @IsString({ each: true })
  outcomes: string[];

  @ApiProperty({ description: 'When the market closes for betting' })
  @IsDateString()
  closingTime: string;

  @ApiPropertyOptional({ description: 'When the market will be resolved' })
  @IsDateString()
  @IsOptional()
  resolutionTime?: string;

  @ApiPropertyOptional({ description: 'Market category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Market tags' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class MarketQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by market status', enum: MarketStatus })
  @IsEnum(MarketStatus)
  @IsOptional()
  status?: MarketStatus;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsString()
  @IsOptional()
  category?: string;
}

export class PoolDto {
  @ApiProperty({ description: 'Amount in outcome A pool' })
  outcomeA: number;

  @ApiProperty({ description: 'Amount in outcome B pool' })
  outcomeB: number;

  @ApiProperty({ description: 'Total amount in all pools' })
  total: number;
}

export class MarketMetadataDto {
  @ApiProperty({ description: 'Controversy score (0-1)' })
  controversyScore: number;

  @ApiProperty({ description: 'Market category' })
  category: string;

  @ApiProperty({ description: 'Market tags' })
  tags: string[];
}

export class MarketDto {
  @ApiProperty({ description: 'Market ID' })
  marketId: string;

  @ApiProperty({ description: 'The market question' })
  question: string;

  @ApiPropertyOptional({ description: 'Detailed description of the market' })
  description?: string;

  @ApiProperty({ description: 'Array of possible outcomes' })
  outcomes: string[];

  @ApiProperty({ description: 'When the market closes for betting' })
  closingTime: string;

  @ApiPropertyOptional({ description: 'When the market will be resolved' })
  resolutionTime?: string;

  @ApiProperty({ description: 'Market status', enum: MarketStatus })
  status: MarketStatus;

  @ApiProperty({ description: 'Betting pools' })
  pools: PoolDto;

  @ApiProperty({ description: 'Market metadata' })
  metadata: MarketMetadataDto;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string;
}

export class MarketResponseDto {
  @ApiProperty({ description: 'Whether the request was successful' })
  success: boolean;

  @ApiProperty({ description: 'Market data' })
  data: MarketDto;

  @ApiPropertyOptional({ description: 'Response message' })
  message?: string;
}

export class MarketListResponseDto {
  @ApiProperty({ description: 'Whether the request was successful' })
  success: boolean;

  @ApiProperty({ description: 'Array of markets' })
  data: MarketDto[];

  @ApiPropertyOptional({ description: 'Pagination information' })
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  @ApiPropertyOptional({ description: 'Response message' })
  message?: string;
}
