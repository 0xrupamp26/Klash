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
        enum: ['OPEN', 'CLOSED', 'RESOLVED', 'CANCELLED'],
        default: 'OPEN',
    })
    status: string;

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
        },
        default: {},
    })
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
}

export const MarketSchema = SchemaFactory.createForClass(Market);
