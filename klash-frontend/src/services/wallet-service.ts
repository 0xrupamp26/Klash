import { AptosClient, AptosAccount, FaucetClient, Types } from 'aptos';

// Aptos Testnet configuration
const NODE_URL = 'https://fullnode.testnet.aptoslabs.com/v1';
const FAUCET_URL = 'https://faucet.testnet.aptoslabs.com';

export class WalletService {
    private client: AptosClient;
    private faucetClient: FaucetClient;
    private account: AptosAccount | null = null;

    constructor() {
        this.client = new AptosClient(NODE_URL);
        this.faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);
    }

    /**
     * Connect wallet (for demo: create new account)
     * In production, use Petra wallet extension
     */
    async connectWallet(): Promise<string> {
        // For demo: create a new account
        this.account = new AptosAccount();
        const address = this.account.address().hex();

        // Fund the account from faucet
        await this.fundAccount(address);

        return address;
    }

    /**
     * Get wallet address
     */
    getWalletAddress(): string | null {
        return this.account ? this.account.address().hex() : null;
    }

    /**
     * Check if wallet is connected
     */
    isConnected(): boolean {
        return this.account !== null;
    }

    /**
     * Get account balance
     */
    async getBalance(address?: string): Promise<number> {
        const addr = address || this.getWalletAddress();
        if (!addr) throw new Error('No wallet connected');

        try {
            const resources = await this.client.getAccountResources(addr);
            const accountResource = resources.find(
                (r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
            );

            if (accountResource) {
                const balance = (accountResource.data as any).coin.value;
                return parseInt(balance) / 100000000; // Convert from Octas to APT
            }
            return 0;
        } catch (error) {
            console.error('Error getting balance:', error);
            return 0;
        }
    }

    /**
     * Fund account from faucet (testnet only)
     */
    async fundAccount(address?: string): Promise<void> {
        const addr = address || this.getWalletAddress();
        if (!addr) throw new Error('No wallet connected');

        try {
            await this.faucetClient.fundAccount(addr, 100000000); // 1 APT
            console.log('Account funded with 1 APT from faucet');
        } catch (error) {
            console.error('Error funding account:', error);
            throw error;
        }
    }

    /**
     * Sign and submit transaction
     */
    async signAndSubmitTransaction(payload: Types.TransactionPayload): Promise<string> {
        if (!this.account) throw new Error('No wallet connected');

        try {
            const txnRequest = await this.client.generateTransaction(
                this.account.address(),
                payload
            );
            const signedTxn = await this.client.signTransaction(this.account, txnRequest);
            const transactionRes = await this.client.submitTransaction(signedTxn);
            await this.client.waitForTransaction(transactionRes.hash);

            return transactionRes.hash;
        } catch (error) {
            console.error('Transaction error:', error);
            throw error;
        }
    }

    /**
     * Disconnect wallet
     */
    disconnect(): void {
        this.account = null;
    }

    /**
     * Get faucet URL for manual funding
     */
    getFaucetUrl(): string {
        return 'https://aptoslabs.com/testnet-faucet';
    }
}

// Singleton instance
export const walletService = new WalletService();
