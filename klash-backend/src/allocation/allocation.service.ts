import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

declare const require: any;
const aptos = require('aptos');

@Injectable()
export class AllocationService {
  private readonly logger = new Logger(AllocationService.name);
  private readonly aptosClient: any;
  private readonly adminAccount: any;
  private readonly moduleAddress: string;

  constructor(private configService: ConfigService) {
    const nodeUrl = this.configService.get<string>('APTOS_NODE_URL') || 'https://fullnode.testnet.aptoslabs.com';
    this.aptosClient = new aptos.AptosClient(nodeUrl);
    
    this.moduleAddress = this.configService.get<string>('KLASH_MODULE_ADDRESS') || '';
    const privateKey = this.configService.get<string>('PRIVATE_KEY') || '';
    
    if (!this.moduleAddress || !privateKey) {
      this.logger.error('Missing required configuration for Aptos module');
      throw new Error('KLASH_MODULE_ADDRESS and PRIVATE_KEY must be provided');
    }
    
    this.adminAccount = new aptos.AptosAccount(
      new Uint8Array(Buffer.from(privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey, 'hex'))
    );
  }

  async resolveMarket(marketId: string, winningOutcome: number): Promise<string> {
    try {
      const payload = {
        type: 'entry_function_payload',
        function: `${this.moduleAddress}::market::resolve_market`,
        type_arguments: [],
        arguments: [
          marketId,
          winningOutcome.toString()
        ],
      };

      const rawTxn = await this.aptosClient.generateTransaction(this.adminAccount.address(), payload);
      const signedTxn = await this.aptosClient.signTransaction(this.adminAccount, rawTxn);
      const transactionRes = await this.aptosClient.submitTransaction(signedTxn);

      await this.aptosClient.waitForTransaction(transactionRes.hash);

      this.logger.log(`Market resolved successfully: ${marketId}`);
      return transactionRes.hash;
    } catch (error) {
      this.logger.error('Error resolving market:', error);
      throw new Error(`Failed to resolve market: ${error.message}`);
    }
  }

  async claimPayout(userAddress: string, marketId: string): Promise<string> {
    try {
      const payload = {
        type: 'entry_function_payload',
        function: `${this.moduleAddress}::market::claim_payout`,
        type_arguments: [],
        arguments: [
          userAddress,
          marketId
        ],
      };

      const rawTxn = await this.aptosClient.generateTransaction(this.adminAccount.address(), payload);
      const signedTxn = await this.aptosClient.signTransaction(this.adminAccount, rawTxn);
      const transactionRes = await this.aptosClient.submitTransaction(signedTxn);

      await this.aptosClient.waitForTransaction(transactionRes.hash);

      this.logger.log(`Payout claimed successfully for user ${userAddress} in market ${marketId}`);
      return transactionRes.hash;
    } catch (error) {
      this.logger.error('Error claiming payout:', error);
      throw new Error(`Failed to claim payout: ${error.message}`);
    }
  }
}
