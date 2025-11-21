# PRD: Backend Arbitrum Service

- **Module Name**: backend-arbitrum-service
- **Goal**: Integrate NestJS backend with Stylus contract on Arbitrum Sepolia and Orbit. Provide market creation, resolution with EIP-712 proof, and read endpoints.

## Files To Add
- `klash-backend/src/arb/arb.module.ts`
- `klash-backend/src/arb/arb.service.ts`
- `.env` keys

## Env Vars
```
ARB_SEPOLIA_RPC=
ORBIT_RPC=
ARB_DEPLOYER_KEY=
ARB_RESOLVER_KEY= // oracle EIP-712 signer
STYLUS_MARKET_ADDR_L2=
STYLUS_MARKET_ADDR_L3=
KLASH_TOKEN_ADDR_L3=
IPFS_GATEWAY=https://w3s.link/ipfs/
PINATA_JWT=  // or WEB3_STORAGE_TOKEN
```

## Service API (internal)
```ts
class ArbitrumService {
  constructor(network: 'l2'|'l3');
  createMarket(params: { erc20: string; question: string; outcomes: string[]; closingTs: number }): Promise<{marketId: string; tx: string}>;
  placeBet(params: { marketId: string; outcome: number; amount: string; account: string }): Promise<{tx: string}>;
  closeMarket(marketId: string): Promise<{tx: string}>;
  resolveMarket(params: { marketId: string; winning: number; analysisJson: any }): Promise<{tx: string; analysisCid: string; analysisHash: string}>;
  claim(marketId: string): Promise<{tx: string}>;
  readMarket(marketId: string): Promise<MarketView>;
}

type MarketView = {
  id: string;
  question: string;
  outcomes: string[];
  closingTs: number;
  status: 'OPEN'|'CLOSED'|'RESOLVED'|'CANCELLED';
  pools: { outcomeA: string; outcomeB: string; total: string };
  winning?: number;
  analysisCid?: string;
  analysisHash?: string;
};
```

## Controller Changes
- Extend existing markets controller or add `arb.controller.ts`:
  - `POST /arb/markets` -> calls `createMarket`.
  - `POST /arb/markets/:id/resolve` -> runs AI, pins JSON, signs EIP-712, resolves onchain.
  - `GET /arb/markets/:id` -> returns `MarketView`.

## Pinning + Proof
- Serialize analysis summary JSON: `{tweetId, sampleSize, model, positive, negative, neutral, outcome, timestamp}`.
- Compute `keccak256` hash of UTF-8 JSON.
- Upload to IPFS; store CID.
- Build EIP-712 `Resolution` and sign with `ARB_RESOLVER_KEY`.
- Call `resolve_market` with `(winning, hash, cid, sig)`.

## Mongoose Additions (optional)
- Extend `Market` with fields: `network`, `l2Address`, `l3Address`, `analysisCid`, `analysisHash`.

## Acceptance Tests
1. Create market and verify chain storage.
2. Auto-resolve using controversy service and verify proof onchain.
3. Read `MarketView` matches onchain fields.
