import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeedService } from './seed.service';
import { Market, MarketSchema } from '../schemas/market.schema';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_URI'),
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([{ name: Market.name, schema: MarketSchema }]),
    ],
    providers: [],
    exports: [MongooseModule],
})
export class DatabaseModule { }
