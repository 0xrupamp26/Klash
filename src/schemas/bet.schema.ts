import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BetDocument = Bet & Document;

@Schema({ timestamps: true })
export class Bet {
    @Prop({ required: true, unique: true })
    betId: string;

    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    marketId: string;

    @Prop({ required: true })
    outcome: number;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    walletAddress: string;

    @Prop({
        enum: ['PENDING', 'ACTIVE', 'WON', 'LOST', 'REFUNDED', 'PAID'],
        default: 'PENDING',
    })
    status: string;

    @Prop()
    payout: number;

    @Prop()
    profit: number;

    @Prop()
    transactionHash: string;

    @Prop()
    resolvedAt: Date;

    @Prop()
    paidAt: Date;

    @Prop({
        type: {
            atPlacement: Number,
            poolRatio: Number,
        },
        default: {},
    })
    odds: {
        atPlacement: number;
        poolRatio: number;
    };
}

export const BetSchema = SchemaFactory.createForClass(Bet);
