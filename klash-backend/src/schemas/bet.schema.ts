import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BetDocument = Bet & Document;

@Schema({ timestamps: true })
export class Bet {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  marketId: string;

  @Prop({ required: true })
  outcome: number;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  walletAddress: string;

  @Prop({ 
    required: true, 
    default: 'PENDING', 
    enum: ['PENDING', 'ACTIVE', 'WON', 'LOST', 'REFUNDED', 'PAID'] 
  })
  status: string;

  @Prop()
  payout: number;

  @Prop()
  profit: number;

  @Prop({ index: true })
  transactionHash: string;

  @Prop({ default: Date.now })
  placedAt: Date;

  @Prop()
  resolvedAt: Date;

  @Prop()
  paidAt: Date;

  @Prop({ type: Object })
  odds: {
    atPlacement: number;
    poolRatio: number;
  };

  @Prop({ type: Object })
  resolutionData: {
    method: string;
    confidence: number;
    marketSnapshot: any;
  };
}

export const BetSchema = SchemaFactory.createForClass(Bet);

// Add indexes
BetSchema.index({ userId: 1, marketId: 1 }, { unique: true });
BetSchema.index({ marketId: 1, status: 1 });
BetSchema.index({ status: 1, resolvedAt: 1 });
BetSchema.index({ walletAddress: 1, status: 1 });
