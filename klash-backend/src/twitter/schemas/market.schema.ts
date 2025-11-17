import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MarketDocument = Market & Document;

export enum MarketStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  RESOLVED = 'RESOLVED',
}

export enum ResolutionMethod {
  SENTIMENT = 'sentiment',
  ORACLE = 'oracle',
  MANUAL = 'manual',
}

class ResolutionData {
  @Prop({ type: String, enum: ResolutionMethod, required: true })
  method: ResolutionMethod;

  @Prop({ type: Number, min: 0, max: 1 })
  confidence?: number;

  @Prop({ type: Number, default: 0 })
  totalAnalyzed?: number;

  @Prop({ type: Object, default: {} })
  sentimentBreakdown?: Record<string, any>;
}

class TeamStats {
  @Prop({ type: Number, default: 0 })
  count: number;

  @Prop({ type: Number, min: 0, max: 100 })
  percentage: number;

  @Prop({ type: Number, min: 0, max: 1 })
  avgConfidence: number;
}

@Schema({ timestamps: true })
export class Market {
  @Prop({ type: String, required: true, unique: true, index: true })
  marketId: string;

  @Prop({ type: String, required: true })
  question: string;

  @Prop({ type: [String], required: true, validate: {
    validator: (v: string[]) => v.length >= 2,
    message: 'At least two outcomes are required'
  }})
  outcomes: string[];

  @Prop({ type: String, required: true })
  originalTweetId: string;

  @Prop({ 
    type: String, 
    enum: MarketStatus, 
    default: MarketStatus.OPEN,
    index: true 
  })
  status: MarketStatus;

  @Prop({ type: Date, index: true })
  closingTime?: Date;

  @Prop({ type: Date })
  resolutionTime?: Date;

  @Prop({ type: String })
  winningOutcome?: string;

  @Prop({ type: Number, min: 0 })
  winningIndex?: number;

  @Prop({ type: ResolutionData })
  resolutionData?: ResolutionData;

  @Prop({ type: Map, of: TeamStats, default: {} })
  teamStats?: Map<string, TeamStats>;

  @Prop({ type: String })
  aptosMarketAddress?: string;
}

export const MarketSchema = SchemaFactory.createForClass(Market);

// Add indexes
MarketSchema.index({ marketId: 1 }, { unique: true });
MarketSchema.index({ status: 1 });
MarketSchema.index({ closingTime: 1 });
MarketSchema.index({ 'resolutionData.method': 1 });
