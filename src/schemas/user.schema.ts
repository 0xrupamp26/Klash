import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  walletAddress: string;

  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop({ enum: ['USER', 'ADMIN', 'MODERATOR'], default: 'USER' })
  role: string;

  @Prop({
    type: {
      totalBets: { type: Number, default: 0 },
      totalWon: { type: Number, default: 0 },
      totalLost: { type: Number, default: 0 },
      totalProfit: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
    },
    default: {},
  })
  stats: {
    totalBets: number;
    totalWon: number;
    totalLost: number;
    totalProfit: number;
    winRate: number;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
