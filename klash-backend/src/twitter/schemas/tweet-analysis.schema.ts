import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TweetAnalysisDocument = TweetAnalysis & Document;

export enum SentimentLabel {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
}

class SentimentAnalysis {
  @Prop({ 
    type: String, 
    enum: SentimentLabel, 
    required: true 
  })
  label: SentimentLabel;

  @Prop({ 
    type: Number, 
    required: true,
    min: -1,
    max: 1
  })
  polarity: number;

  @Prop({ 
    type: Number, 
    required: true,
    min: 0,
    max: 1
  })
  confidence: number;
}

@Schema({ timestamps: true })
export class TweetAnalysis {
  @Prop({ 
    type: String, 
    required: true, 
    index: true 
  })
  tweetId: string;

  @Prop({ 
    type: String, 
    required: true, 
    index: true 
  })
  marketId: string;

  @Prop({ type: String, required: true })
  text: string;

  @Prop({ type: String })
  author?: string;

  @Prop({ type: SentimentAnalysis })
  sentiment?: {
    label: SentimentLabel;
    polarity: number;
    confidence: number;
  };

  @Prop({ type: String })
  teamClassification?: string;

  @Prop({ 
    type: Number, 
    min: 0, 
    max: 1 
  })
  classificationConfidence?: number;

  @Prop({ 
    type: Date, 
    default: Date.now 
  })
  analyzedAt: Date;
}

export const TweetAnalysisSchema = SchemaFactory.createForClass(TweetAnalysis);

// Add indexes
TweetAnalysisSchema.index({ tweetId: 1, marketId: 1 }, { unique: true });
TweetAnalysisSchema.index({ marketId: 1 });
TweetAnalysisSchema.index({ 'sentiment.label': 1 });
TweetAnalysisSchema.index({ teamClassification: 1 });
