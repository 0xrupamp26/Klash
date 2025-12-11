import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MarketsService } from '../markets/markets.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly marketsService: MarketsService) {}

  async onModuleInit() {
    await this.seedMarkets();
  }

  private async seedMarkets() {
    try {
      const existingMarkets = await this.marketsService.findAll();

      if (existingMarkets.length > 0) {
        this.logger.log('Markets already seeded, skipping...');
        return;
      }

      this.logger.log('Seeding demo markets...');

      const demoMarkets = [
        {
          question: 'Will this controversial tweet spark a major debate?',
          outcomes: ['Yes', 'No'],
          originalTweetId: '1995887135661126136',
          originalTweetText: 'Controversial content from @BR4ted',
          originalTweetAuthor: 'BR4ted',
          status: 'WAITING_PLAYERS',
          marketType: 'TWO_PLAYER',
          playerLimit: 2,
          closingTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          resolutionTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          pools: { total: 0, outcomeA: 0, outcomeB: 0 },
          platformFeePercent: 2,
          currentPlayers: [],
          metadata: {
            category: 'Social',
            tags: ['twitter', 'controversy', 'debate'],
            controversyScore: 0.95,
            createdBy: 'SEED',
            tweetUrl: 'https://x.com/BR4ted/status/1995887135661126136?s=20',
            description:
              'Based on the controversial tweet from @BR4ted. Will this spark a major debate in the community?',
          },
        },
      ];

      for (const market of demoMarkets) {
        await this.marketsService.create(market);
      }

      this.logger.log(
        `Seeded ${demoMarkets.length} demo markets successfully!`,
      );
    } catch (error) {
      this.logger.error('Error seeding markets:', error.message);
    }
  }
}
