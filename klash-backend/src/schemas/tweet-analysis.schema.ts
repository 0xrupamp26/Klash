import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TweetAnalysisDocument = TweetAnalysis & Document;

@Schema({ timestamps: true })
export class TweetAnalysis {
  @Prop({ required: true, index: true })
  tweetId: string;

  @Prop({ required: true, index: true })
  marketId: string;

  @Prop({ required: true })
  text: string;

  @Prop()
  author: string;

  @Prop({ type: Object })
  sentiment: {
    label: string;
    polarity: number;
    confidence: number;
  };

  @Prop()
  teamClassification: string;

  @Prop()
  classificationConfidence: number;

  @Prop({ default: false })
  isSpam: boolean;

  @Prop({ default: false })
  isAdminOverride: boolean;

  @Prop({ type: Object })
  authorMetrics: {
    followers: number;
    accountAge: number;
    verified: boolean;
  };

  @Prop()
  analyzedAt: Date;

  @Prop()
  rawData: any;
}

export const TweetAnalysisSchema = SchemaFactory.createForClass(TweetAnalysis);

// Add indexes
TweetAnalysisSchema.index({ marketId: 1, analyzedAt: -1 });
TweetAnalysisSchema.index({ 'sentiment.label': 1 });
TweetAnalysisSchema.index({ teamClassification: 1 });
TweetAnalysisSchema.index({ isSpam: 1 });
TweetAnalysisSchema.index({ 'authorMetrics.followers': -1 });
