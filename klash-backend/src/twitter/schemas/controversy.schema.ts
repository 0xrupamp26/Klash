import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ControversyDocument = Controversy & Document;

export enum ControversyStatus {
  PENDING = 'PENDING',
  MARKET_CREATED = 'MARKET_CREATED',
  RESOLVED = 'RESOLVED',
}

@Schema({ timestamps: true })
export class Controversy {
  @Prop({ required: true, unique: true })
  tweetId: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true, type: Number })
  controversyScore: number;

  @Prop({ type: Object })
  metrics: {
    replies: number;
    retweets: number;
    likes: number;
    quotes: number;
  };

  @Prop({ type: String, enum: Object.values(ControversyStatus), default: ControversyStatus.PENDING })
  status: ControversyStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Market' })
  marketId?: string;

  @Prop()
  resolvedOutcome?: string;

  @Prop()
  resolvedAt?: Date;

  @Prop({ type: Object })
  sentimentAnalysis?: {
    outcome: string;
    avgPolarity: number;
    avgSubjectivity: number;
    sampleSize: number;
  };
}

export const ControversySchema = SchemaFactory.createForClass(Controversy);

// Add indexes for better query performance
ControversySchema.index({ tweetId: 1 }, { unique: true });
ControversySchema.index({ status: 1 });
ControversySchema.index({ author: 1 });
ControversySchema.index({ controversyScore: -1 });
ControversySchema.index({ createdAt: -1 });
