import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MarketDocument = Market & Document;

@Schema({ timestamps: true })
export class Market {
  @Prop({ required: true, unique: true })
  marketId: string;

  @Prop({ required: true })
  question: string;

  @Prop([String])
  outcomes: string[];

  @Prop()
  originalTweetId: string;

  @Prop()
  originalTweetText: string;

  @Prop()
  originalTweetAuthor: string;

  @Prop({
    enum: [
      'WAITING_PLAYERS',
      'ACTIVE',
      'CLOSED',
      'RESOLVING',
      'RESOLVED',
      'CANCELLED',
    ],
    default: 'WAITING_PLAYERS',
  })
  status: string;

  @Prop({
    enum: ['TWO_PLAYER', 'MULTI_PLAYER'],
    default: 'TWO_PLAYER',
  })
  marketType: string;

  @Prop({ default: 2 })
  playerLimit: number;

  @Prop({
    type: [
      {
        walletAddress: String,
        outcome: Number,
        amount: Number,
        timestamp: Date,
      },
    ],
    default: [],
  })
  currentPlayers: Array<{
    walletAddress: string;
    outcome: number;
    amount: number;
    timestamp: Date;
  }>;

  @Prop({ default: 2 })
  platformFeePercent: number;

  @Prop()
  closingTime: Date;

  @Prop()
  resolutionTime: Date;

  @Prop()
  winningOutcome: number;

  @Prop({
    type: {
      total: { type: Number, default: 0 },
      outcomeA: { type: Number, default: 0 },
      outcomeB: { type: Number, default: 0 },
    },
    default: {},
  })
  pools: {
    total: number;
    outcomeA: number;
    outcomeB: number;
  };

  @Prop({
    type: {
      category: String,
      tags: [String],
      controversyScore: Number,
      createdBy: String,
      tweetUrl: String,
      description: String,
    },
    default: {},
  })
  metadata: {
    category: string;
    tags: string[];
    controversyScore: number;
    createdBy: string;
    tweetUrl?: string;
    description?: string;
  };

  @Prop({ default: 0 })
  totalBets: number;

  @Prop({ default: 0 })
  uniqueBettors: number;
}

export const MarketSchema = SchemaFactory.createForClass(Market);
