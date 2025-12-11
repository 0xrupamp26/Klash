import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Market, MarketDocument } from '../schemas/market.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectModel(Market.name) private marketModel: Model<MarketDocument>,
  ) {}

  async onModuleInit() {
    // Seeding disabled - only show real markets from Twitter AI pipeline
    // To enable sample data for testing, uncomment the code below:

    // const count = await this.marketModel.countDocuments();
    // if (count === 0) {
    //   console.log('Seeding database with sample markets...');
    //   await this.seedMarkets();
    // }

    console.log(
      'Seed service: Sample data disabled. Use Twitter AI pipeline to create markets.',
    );
  }

  // Sample data method (disabled)
  private async seedMarkets() {
    // This method is disabled. Markets will be created by the Twitter AI pipeline.
  }
}
