import { Injectable, Logger, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InMemoryMarketsService } from './in-memory-markets.service';
import { InMemoryBetsService } from '../bets/in-memory-bets.service';
import { MarketGateway } from '../websocket/market.gateway';

@Injectable()
export class MarketResolutionService {
    private readonly logger = new Logger(MarketResolutionService.name);

    constructor(
        private inMemoryMarketsService: InMemoryMarketsService,
        @Inject(forwardRef(() => InMemoryBetsService))
        private inMemoryBetsService: InMemoryBetsService,
        private marketGateway: MarketGateway,
    ) { }

    async checkAndActivateMarket(marketId: string): Promise<void> {
        const market = await this.inMemoryMarketsService.findOne(marketId);

        if (!market) {
            throw new BadRequestException('Market not found');
        }

        if (market.status !== 'WAITING_PLAYERS') {
            return;
        }

        if (market.currentPlayers.length >= market.playerLimit) {
            market.status = 'ACTIVE';
            await this.inMemoryMarketsService.update(market.marketId, market);

            this.logger.log(`Market ${marketId} activated with ${market.currentPlayers.length} players`);

            this.marketGateway.marketStatusChanged(marketId, 'ACTIVE', {
                playerCount: market.currentPlayers.length,
                message: 'Market is now active! All players have joined.',
            });

            setTimeout(() => this.resolveMarket(marketId), 10000);
        }
    }

    async resolveMarket(marketId: string): Promise<void> {
        const market = await this.inMemoryMarketsService.findOne(marketId);

        if (!market || market.status === 'RESOLVED') {
            return;
        }

        this.logger.log(`Resolving market ${marketId}...`);

        market.status = 'RESOLVING';
        await this.inMemoryMarketsService.update(market.marketId, market);

        // Deterministic resolution for demo: If "Yes" wins, outcome 0. If "No" wins, outcome 1.
        // For simulation, let's randomize it just like before.
        const winningOutcome = Math.random() < 0.5 ? 0 : 1;

        const bets = await this.inMemoryBetsService.findByMarket(marketId);

        const winners = bets.filter(bet => bet.outcome === winningOutcome);
        const losers = bets.filter(bet => bet.outcome !== winningOutcome);

        const totalPool = bets.reduce((sum, bet) => sum + bet.amount, 0);
        const platformFee = totalPool * (market.platformFeePercent / 100);
        const winnerPool = totalPool - platformFee;

        const payoutPerWinner = winners.length > 0 ? winnerPool / winners.length : 0;

        for (const bet of winners) {
            await this.inMemoryBetsService.update(bet.betId, {
                ...bet,
                status: 'WON',
                payout: payoutPerWinner,
                profit: payoutPerWinner - bet.amount,
                resolvedAt: new Date(),
            });
        }

        for (const bet of losers) {
            await this.inMemoryBetsService.update(bet.betId, {
                ...bet,
                status: 'LOST',
                payout: 0,
                profit: -bet.amount,
                resolvedAt: new Date(),
            });
        }

        market.status = 'RESOLVED';
        market.winningOutcome = winningOutcome;
        market.resolutionTime = new Date();
        await this.inMemoryMarketsService.update(market.marketId, market);

        this.logger.log(
            `Market ${marketId} resolved. Outcome: ${winningOutcome}. ` +
            `Winners: ${winners.length}, Losers: ${losers.length}, ` +
            `Platform Fee: ${platformFee}, Payout per winner: ${payoutPerWinner}`
        );

        this.marketGateway.marketResolved(marketId, {
            winningOutcome,
            winnersCount: winners.length,
            losersCount: losers.length,
            totalPool,
            platformFee,
            payoutPerWinner,
            question: market.question,
            winningAnswer: market.outcomes[winningOutcome],
        });
    }
}
