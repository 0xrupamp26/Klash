# PRD: Frontend Integration (Arbitrum + Orbit)

- **Module Name**: frontend-integration
- **Goal**: Replace mocks with live markets, enable bet/claim on Arbitrum Sepolia and Orbit, display AI resolution proof.

## Dependencies
- `wagmi`, `viem`, `@tanstack/react-query` already present

## Config
- Add `klash-frontend/src/lib/chains.ts`:
```ts
export const chains = {
  arbitrumSepolia: { id: 421614, name: 'Arbitrum Sepolia', rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'] },
  klashChain: { id: 777701, name: 'KlashChain', rpcUrls: ['http://localhost:8547'] }
};
```
- Add contract addresses in `.env` or `config/contracts.ts`:
```ts
export const contracts = {
  stylusMarket: { l2: '0x...', l3: '0x...' },
  klashToken: { l3: '0x...' }
};
```

## UI Changes
- `pages/Index.tsx`:
  - Fetch markets via backend `GET /markets` (or `/arb/markets`).
  - Replace `mockMarkets` with API data.
- `pages/MarketDetail.tsx`:
  - Show pools, status, countdown to `closingTs`.
  - Buttons: Place Bet (amount, outcome), Claim (if winner and resolved).
  - “Proof of Resolution” panel: IPFS CID link and `analysisHash`.
- Top-right network switch: L2 vs KlashChain.

## Hook Contracts
```ts
useMarketRead(network: 'l2'|'l3', marketId: string): MarketView
usePlaceBet(network, marketId, outcome, amount)
useClaim(network, marketId)
```

## Request/Response Shapes
```ts
GET /arb/markets/:id -> MarketView
POST /arb/markets -> { question, outcomes, closingTs, erc20? } -> { marketId, tx }
POST /arb/markets/:id/bet -> { outcome, amount } -> { tx }
POST /arb/markets/:id/claim -> { } -> { tx }
```

## Acceptance Tests
1. List and display markets from backend.
2. Execute bet on L2, see pending state, confirm and refresh pool amounts.
3. Switch to Orbit and repeat bet with visibly lower fee.
4. After resolution, show winning outcome and proof panel.
