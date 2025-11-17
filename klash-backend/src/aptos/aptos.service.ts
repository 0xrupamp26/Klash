import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

declare const require: any;
const aptos = require('aptos');

@Injectable()
export class AptosService {
  private readonly logger = new Logger(AptosService.name);
  private readonly aptosClient: any;
  private readonly adminAccount: any;
  private readonly contractAddress: string;

  constructor(private readonly configService: ConfigService) {
    const nodeUrl = this.configService.get<string>('APTOS_NODE_URL') || 'https://fullnode.testnet.aptoslabs.com';
    this.aptosClient = new aptos.AptosClient(nodeUrl);
    
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('PRIVATE_KEY is required');
    }
    
    this.adminAccount = new aptos.AptosAccount(
      new Uint8Array(Buffer.from(privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey, 'hex'))
    );
    
    this.contractAddress = this.configService.get<string>('KLASH_MODULE_ADDRESS') || '';
  }

  async createMarket(
    question: string,
    outcomes: string[],
    closingTime: number,
  ): Promise<{ id: string; transactionHash: string; status: 'pending' }> {
    try {
      const marketId = `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const payload = {
        type: 'entry_function_payload',
        function: `${this.contractAddress}::market::create_market`,
        type_arguments: [],
        arguments: [
          marketId,
          question,
          outcomes,
          closingTime.toString()
        ],
      };

      const rawTxn = await this.aptosClient.generateTransaction(this.adminAccount.address(), payload);
      const signedTxn = await this.aptosClient.signTransaction(this.adminAccount, rawTxn);
      const transactionRes = await this.aptosClient.submitTransaction(signedTxn);

      await this.aptosClient.waitForTransaction(transactionRes.hash);

      this.logger.log(`Market created successfully: ${marketId}`);
      return {
        id: marketId,
        transactionHash: transactionRes.hash,
        status: 'pending',
      };
    } catch (error) {
      this.logger.error('Error creating market:', error);
      throw new Error(`Failed to create market: ${error.message}`);
    }
  }

  async placeBet(
    marketId: string,
    outcome: number,
    amount: number,
    userAddress: string,
  ): Promise<{ transactionHash: string; status: 'pending' }> {
    try {
      const payload = {
        type: 'entry_function_payload',
        function: `${this.contractAddress}::market::place_bet`,
        type_arguments: [],
        arguments: [
          marketId,
          outcome.toString(),
          amount.toString(),
          userAddress
        ],
      };

      const rawTxn = await this.aptosClient.generateTransaction(this.adminAccount.address(), payload);
      const signedTxn = await this.aptosClient.signTransaction(this.adminAccount, rawTxn);
      const transactionRes = await this.aptosClient.submitTransaction(signedTxn);

      await this.aptosClient.waitForTransaction(transactionRes.hash);

      this.logger.log(`Bet placed successfully for market ${marketId}`);
      return {
        transactionHash: transactionRes.hash,
        status: 'pending',
      };
    } catch (error) {
      this.logger.error('Error placing bet:', error);
      throw new Error(`Failed to place bet: ${error.message}`);
    }
  }

  async resolveMarket(
    marketId: string,
    winningOutcome: number,
  ): Promise<{ transactionHash: string; status: 'pending' }> {
    try {
      const payload = {
        type: 'entry_function_payload',
        function: `${this.contractAddress}::market::resolve_market`,
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
      return {
        transactionHash: transactionRes.hash,
        status: 'pending',
      };
    } catch (error) {
      this.logger.error('Error resolving market:', error);
      throw new Error(`Failed to resolve market: ${error.message}`);
    }
  }

  async getMarket(marketId: string): Promise<any> {
    try {
      const marketResource = await this.aptosClient.getAccountResource(
        this.contractAddress,
        `${this.contractAddress}::market::Market`
      );
      
      return marketResource.data;
    } catch (error) {
      this.logger.error(`Error fetching market ${marketId}:`, error);
      throw new Error(`Failed to fetch market: ${error.message}`);
    }
  }

  async getAccountBalance(address: string): Promise<number> {
    try {
      const resources = await this.aptosClient.getAccountResources(address);
      const coinResource = resources.find((r: any) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');
      
      if (coinResource) {
        return parseInt((coinResource.data as any).coin.value);
      }
      
      return 0;
    } catch (error) {
      this.logger.error(`Error fetching balance for address ${address}:`, error);
      return 0;
    }
  }
}
