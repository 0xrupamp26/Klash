import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  Aptos, 
  AptosConfig, 
  Network, 
  Account, 
  AccountAddress, 
  TransactionPayload,
  AccountAuthenticator,
  Ed25519PrivateKey
} from '@aptos-labs/ts-sdk';

@Injectable()
export class AptosService {
  private readonly logger = new Logger(AptosService.name);
  private readonly aptos: Aptos;
  private readonly adminAccount: Account;
  private readonly contractAddress: string;

  constructor(private readonly configService: ConfigService) {
    const nodeUrl = this.configService.get<string>('APTOS_NODE_URL');
    const privateKey = this.configService.get<string>('APTOS_ADMIN_PRIVATE_KEY');
    const contractAddress = this.configService.get<string>('APTOS_CONTRACT_ADDRESS');
    
    if (!nodeUrl) {
      throw new Error('APTOS_NODE_URL is not defined in environment variables');
    }
    
    if (!privateKey) {
      throw new Error('APTOS_ADMIN_PRIVATE_KEY is not defined in environment variables');
    }

    if (!contractAddress) {
      throw new Error('APTOS_CONTRACT_ADDRESS is not defined in environment variables');
    }
    
    this.aptos = new Aptos(
      new AptosConfig({ 
        network: Network.TESTNET,
        fullnode: nodeUrl,
      })
    );
    
    this.contractAddress = contractAddress;
    
    try {
      const privateKeyObj = new Ed25519PrivateKey(privateKey);
      this.adminAccount = Account.fromPrivateKey({ privateKey: privateKeyObj });
    } catch (error) {
      throw new Error(`Failed to initialize admin account: ${error.message}`);
    }
  }

  async createMarket(description: string, outcomes: string[], closingTime: number) {
    try {
      const payload: TransactionPayload = {
        type: 'entry_function_payload',
        function: `${this.contractAddress}::market::create_market`,
        type_arguments: [],
        arguments: [description, outcomes, closingTime.toString()],
      };

      const rawTxn = await this.aptos.transaction.build.simple({
        sender: this.adminAccount.accountAddress,
        data: payload,
      });

      const signer = this.adminAccount as any; // Temporary workaround for type issues
      const signedTxn = await signer.signTransaction(rawTxn);

      const pendingTxn = await this.aptos.transaction.submit.simple({
        transaction: signedTxn,
        senderAuthenticator: signedTxn.signature as AccountAuthenticator,
      });

      await this.aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
      
      return { 
        id: pendingTxn.hash,
        transactionHash: pendingTxn.hash,
        status: 'pending' as const
      };
    } catch (error) {
      this.logger.error('Error creating market:', error);
      throw new Error(`Failed to create market: ${error.message}`);
    }
  }

  async resolveMarket(marketId: string, winningOutcome: number) {
    try {
      const payload: TransactionPayload = {
        type: 'entry_function_payload',
        function: `${this.contractAddress}::market::resolve_market`,
        type_arguments: [],
        arguments: [marketId, winningOutcome.toString()],
      };

      const rawTxn = await this.aptos.transaction.build.simple({
        sender: this.adminAccount.accountAddress,
        data: payload,
      });

      const signer = this.adminAccount as any; // Temporary workaround for type issues
      const signedTxn = await signer.signTransaction(rawTxn);

      const pendingTxn = await this.aptos.transaction.submit.simple({
        transaction: signedTxn,
        senderAuthenticator: signedTxn.signature as AccountAuthenticator,
      });

      await this.aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
      
      return { 
        transactionHash: pendingTxn.hash,
        status: 'success' as const
      };
    } catch (error) {
      this.logger.error('Error resolving market:', error);
      throw new Error(`Failed to resolve market: ${error.message}`);
    }
  }

  async getMarket(marketId: string) {
    try {
      const resources = await this.aptos.getAccountResources({
        accountAddress: AccountAddress.fromString(this.contractAddress),
      });
      
      // Find the market resource by type and ID
      const marketResource = resources.find(
        (r: any) => 
          r.type === `${this.contractAddress}::market::Market` && 
          r.data?.id === marketId
      ) as any;
      
      if (!marketResource) {
        throw new Error(`Market with ID ${marketId} not found`);
      }
      
      return marketResource.data;
    } catch (error) {
      this.logger.error(`Error getting market ${marketId}:`, error);
      throw new Error(`Failed to get market: ${error.message}`);
    }
  }
}
