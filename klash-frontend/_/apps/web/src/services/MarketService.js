import { marketApi, betApi } from "@/services/api-client";
import { aptos, surfClient } from "@/aptos/client";

class MarketService {
  // Get all markets
  async getMarkets() {
    return await marketApi.getAll();
  }

  // Get market by ID
  async getMarketById(id) {
    return await marketApi.getOne(id);
  }

  // Get portfolio for a wallet
  async getPortfolio(walletAddress) {
    const data = await betApi.getPortfolio(walletAddress);
    // Transform backend {open: [], history: []} to flat array if needed by UI
    // Or return as struct. The UI seemed to expect an array in mock.
    // The previous mock reused 'bets'.
    // Let's assume the UI expects a flat list of bets for now.
    // We will combine them.
    return [...data.open, ...data.history];
  }

  // Place a bet - This should now be handled via Surf mostly, but we notify backend.
  // The UI likely calls this. We will update the UI to use the Contract directly.
  // THIS FUNCTION IS DEPRECATED FOR PLACING BETS directly via API.
  // But we can keep it as a wrapper for the backend notification part.
  async placeBet(marketId, side, amount, walletAddress, txHash) {
    return await betApi.placeBet({
      marketId,
      outcome: side === "A" ? 0 : 1, // Mapping: Side A=0, Side B=1. Verify this!
      amount: parseFloat(amount),
      walletAddress,
      transactionHash: txHash
    });
  }
}

export default new MarketService();

export default new MarketService();
