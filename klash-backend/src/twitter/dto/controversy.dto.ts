import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ControversyStatus } from '../schemas/controversy.schema';

export class ControversyMetricsDto {
  @ApiProperty()
  @IsNumber()
  replies: number;

  @ApiProperty()
  @IsNumber()
  retweets: number;

  @ApiProperty()
  @IsNumber()
  likes: number;

  @ApiProperty()
  @IsNumber()
  quotes: number;
}

export class CreateControversyDto {
  @ApiProperty()
  @IsString()
  tweetId: string;

  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty()
  @IsString()
  author: string;

  @ApiProperty()
  @IsNumber()
  controversyScore: number;

  @ApiProperty({ type: ControversyMetricsDto })
  metrics: ControversyMetricsDto;
}

export class UpdateControversyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  marketId?: string;

  @ApiProperty({ enum: ControversyStatus, required: false })
  @IsOptional()
  @IsEnum(ControversyStatus)
  status?: ControversyStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resolvedOutcome?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  sentimentAnalysis?: {
    outcome: string;
    avgPolarity: number;
    avgSubjectivity: number;
    sampleSize: number;
  };
}

export class SearchControversiesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ required: false, enum: ControversyStatus, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ControversyStatus, { each: true })
  status?: ControversyStatus[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minScore?: number;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}

export class AnalyzeSentimentDto {
  @ApiProperty()
  @IsString()
  tweetId: string;

  @ApiProperty({ required: false, default: 50 })
  @IsOptional()
  @IsNumber()
  maxReplies?: number = 50;
}

export class ResolveMarketDto {
  @ApiProperty()
  @IsString()
  marketId: string;

  @ApiProperty()
  @IsString()
  tweetId: string;

  @ApiProperty({ required: false, default: 50 })
  @IsOptional()
  @IsNumber()
  maxReplies?: number = 50;
}
