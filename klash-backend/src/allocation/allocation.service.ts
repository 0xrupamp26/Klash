import { Injectable } from '@nestjs/common';
import { AptosClient, AptosAccount } from 'aptos';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AllocationService {
  private readonly PLATFORM_FEE_BPS: number = 200;
  private readonly BPS_DENOMINATOR: number = 10000;
  private readonly client: AptosClient;
  private readonly moduleAddress: string;
  private readonly privateKey: Uint8Array;

  constructor(private configService: ConfigService) {
    this.client = new AptosClient(this.configService.get('APTOS_NODE_URL'));
    this.moduleAddress = this.configService.get('KLASH_MODULE_ADDRESS');
    this.privateKey = new Uint8Array(
      JSON.parse(this.configService.get('PRIVATE_KEY'))
    );
  }

  async resolveMarket(marketId: string, winningOutcome: number): Promise<string> {
    const account = AptosAccount.fromPrivateKey(this.privateKey);
    
    const payload = {
      type: 'entry_function_payload',
      function: `${this.moduleAddress}::allocation::resolve_and_allocate`,
      type_arguments: [],
      arguments: [
        Buffer.from(marketId).toString('hex'),
        winningOutcome
      ],
    };

    const txnHash = await this.client.generateSignSubmitTransaction(
      account,
      payload
    );
    await this.client.waitForTransaction(txnHash);
    return txnHash;
  }

  async claimPayout(userAddress: string, marketId: string): Promise<string> {
    const account = AptosAccount.fromPrivateKey(this.privateKey);
    
    const payload = {
      type: 'entry_function_payload',
      function: `${this.moduleAddress}::allocation::claim_payout`,
      type_arguments: [],
      arguments: [
        userAddress,
        Buffer.from(marketId).toString('hex')
      ],
    };

    const txnHash = await this.client.generateSignSubmitTransaction(
      account,
      payload
    );
    await this.client.waitForTransaction(txnHash);
    return txnHash;
  }

  calculatePayout(betAmount: number, winningPool: number, losingPool: number): number {
    if (winningPool === 0) return 0;
    
    const feeAmount = (losingPool * this.PLATFORM_FEE_BPS) / this.BPS_DENOMINATOR;
    const remainingPool = losingPool - feeAmount;
    const userShare = (betAmount * remainingPool) / winningPool;
    
    return betAmount + userShare;
  }
}
