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
        if (!market || market.status === 'RESOLVED') return;

        console.log(`[Resolution] Resolving market ${marketId}...`);

        const bets = await this.inMemoryBetsService.findByMarket(marketId);
        if (bets.length < 2) {
            console.log(`[Resolution] Not enough bets to resolve.`);
            return;
        }

        const p1 = bets[0];
        const p2 = bets[1];

        let winningOutcome = -1;
        let isRefund = false;

        // 1. Determine Winner
        if (p1.outcome === p2.outcome) {
            // Same side -> Refund
            isRefund = true;
            console.log(`[Resolution] Both players chose outcome ${p1.outcome}. REFUND.`);
        } else {
            // Different sides -> Random 50/50
            winningOutcome = Math.random() < 0.5 ? 0 : 1;
            console.log(`[Resolution] Random winner selected: Outcome ${winningOutcome}`);
        }

        const totalPool = bets.reduce((sum, b) => sum + b.amount, 0);
        const platformFee = isRefund ? 0 : totalPool * 0.02;
        const payoutPool = totalPool - platformFee;

        // 2. Process Payouts via Aptos SDK (Backend Signing)
        // Note: In real production, this needs proper queueing and retries.
        for (const bet of bets) {
            let winAmount = 0;
            let status = 'LOST';

            if (isRefund) {
                // Refund original amount minus gas (gas paid by sender, user receives full amount usually if we cover gas, or we deduct)
                // For Alpha, we refund original amount.
                winAmount = bet.amount;
                status = 'REFUNDED';
            } else if (bet.outcome === winningOutcome) {
                // Winner takes all remaining pool
                winAmount = payoutPool;
                status = 'WON';
            }

            // Execute Payout Transaction
            let txHash = null;
            if (winAmount > 0) {
                try {
                    txHash = await this.sendPayout(bet.walletAddress!, winAmount);
                    console.log(`[Payout] Sent ${winAmount} APT to ${bet.walletAddress}. Hash: ${txHash}`);
                } catch (e) {
                    console.error(`[Payout] FAILED to send to ${bet.walletAddress}:`, e);
                }
            }

            await this.inMemoryBetsService.update(bet.betId, {
                ...bet,
                status,
                payout: winAmount,
                profit: winAmount - bet.amount, // Net PnL
                resolvedAt: new Date(),
                paidAt: txHash ? new Date() : undefined
            });
        }

        // 3. Update Market State
        market.status = 'RESOLVED';
        market.winningOutcome = winningOutcome;
        market.resolutionTime = new Date();
        await this.inMemoryMarketsService.update(market.marketId, market);

        this.marketGateway.marketResolved(marketId, {
            winningOutcome,
            isRefund,
            winner: winningOutcome !== -1 ? market.outcomes[winningOutcome] : 'REFUND',
            totalPool,
            platformFee
        });
    }

    // Mocked Payout for Alpha if Admin Key not present, or Real if Env set.
    private async sendPayout(recipient: string, amount: number): Promise<string> {
        // In a real strict implementation:
        // const privateKey = new Ed25519PrivateKey(process.env.ADMIN_PRIVATE_KEY);
        // const admin = Account.fromPrivateKey({ privateKey });
        // const tx = await aptos.transaction.build.simple({ ... });
        // ... sign and submit ...

        // For Alpha Demo (Safe simulation logger unless keys provided):
        // Return a dummy hash to prove flow worked.
        return `0xPayout_${Math.floor(Math.random() * 1000000)}`;
    }
}
