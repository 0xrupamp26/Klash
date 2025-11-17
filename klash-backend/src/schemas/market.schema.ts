import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MarketDocument = Market & Document;

@Schema({ timestamps: true })
export class Market {
  @Prop({ required: true, unique: true, index: true })
  marketId: string;

  @Prop({ required: true, trim: true })
  question: string;

  @Prop({ type: [String], required: true })
  outcomes: string[];

  @Prop({ required: true, index: true })
  originalTweetId: string;

  @Prop()
  originalTweetText: string;

  @Prop()
  originalTweetAuthor: string;

  @Prop({ 
    required: true, 
    default: 'OPEN', 
    enum: ['OPEN', 'CLOSED', 'RESOLVED', 'CANCELLED'] 
  })
  status: string;

  @Prop({ required: true, index: true })
  closingTime: Date;

  @Prop()
  resolutionTime: Date;

  @Prop()
  winningOutcome: number;

  @Prop({ type: Object })
  pools: {
    total: number;
    outcomeA: number;
    outcomeB: number;
  };

  @Prop({ type: Object })
  resolutionData: {
    method: string;
    confidence: number;
    sentimentScore: number;
    teamASupport: number;
    teamBSupport: number;
    sampleSize: number;
    aiModel: string;
    processingTime: number;
    adminOverride?: boolean;
    overrideReason?: string;
    performedBy?: string;
  };

  @Prop({ type: Object })
  metadata: {
    category: string;
    tags: string[];
    controversyScore: number;
    createdBy: string;
  };

  @Prop({ default: 0 })
  totalBets: number;

  @Prop({ default: 0 })
  uniqueBettors: number;

  @Prop({ default: 0 })
  resolutionAttempts: number;

  @Prop()
  lastResolutionAttempt: Date;

  @Prop()
  resolutionError: string;
}

export const MarketSchema = SchemaFactory.createForClass(Market);

// Add indexes
MarketSchema.index({ 'metadata.category': 1 });
MarketSchema.index({ createdAt: -1 });
MarketSchema.index({ status: 1, closingTime: 1 });
