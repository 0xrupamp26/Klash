# PRD: Stylus Market Contract (Arbitrum Stylus, Rust)

- **Module Name**: stylus-market
- **Goal**: On-chain markets, bets, resolution, and claims with verifiable AI resolution proof. Gas-efficient math via Rust.
- **Networks**: Arbitrum Sepolia (L2), Orbit L3 (KlashChain)
- **Tokens**: ERC20 stake token (configurable), optional native gas token on Orbit

## Functional Scope
- **create_market(question, outcomes, closing_ts)** creates market and emits MarketCreated.
- **place_bet(erc20, market_id, outcome, amount)** transfers tokens and updates pools; emits BetPlaced.
- **close_market(market_id)** allowed after closing_ts; emits MarketClosed.
- **resolve_market(market_id, winning_outcome, resolution_proof)** verifies EIP-712 oracle signature over resolution hash/CID; emits MarketResolved.
- **claim(market_id)** pays pro-rata winnings from pools; emits WinningsClaimed.
- Fee rake in basis points to treasury address.

## Data Model
```rust
struct Market {
  id: U256,
  creator: Address,
  question: String,
  outcomes: Vec<String>, // size 2 for MVP
  closing_ts: u64,
  status: u8, // 0 OPEN, 1 CLOSED, 2 RESOLVED, 3 CANCELLED
  winning_outcome: u8, // set on resolve
  pools: [U256; 2],
  total: U256,
  erc20: Address,
  analysis_hash: [u8; 32], // keccak256(JSON)
  analysis_cid: String,     // ipfs://...
}

struct BetKey { market_id: U256, user: Address }
struct Bet { outcome: u8, amount: U256, claimed: bool }
```

## Resolution Proof (EIP-712)
- **Domain**: { name: "KlashResolver", version: "1", chainId, verifyingContract }
- **Types**:
```json
{
  "Resolution": [
    {"name":"marketId","type":"uint256"},
    {"name":"winning","type":"uint8"},
    {"name":"analysisHash","type":"bytes32"},
    {"name":"analysisCid","type":"string"}
  ]
}
```
- **Signer**: oracle address (set by owner).

## Public API (Rust Stylus functions)
```rust
fn create_market(
  erc20: Address,
  question: String,
  outcomes: Vec<String>, // length==2
  closing_ts: u64
) -> U256

fn place_bet( market_id: U256, outcome: u8, amount: U256 )

fn close_market( market_id: U256 )

fn resolve_market(
  market_id: U256,
  winning: u8,
  analysis_hash: [u8;32],
  analysis_cid: String,
  sig: Bytes // 65 bytes, over EIP-712 Resolution
)

fn claim( market_id: U256 )

fn set_fee_bps(bps: u16) // owner
fn set_treasury(addr: Address) // owner
fn set_oracle(addr: Address) // owner
```

## Events
```solidity
event MarketCreated(uint256 indexed marketId, address indexed creator, string question);
event BetPlaced(uint256 indexed marketId, address indexed user, uint8 outcome, uint256 amount);
event MarketClosed(uint256 indexed marketId);
event MarketResolved(uint256 indexed marketId, uint8 winning, bytes32 analysisHash, string analysisCid);
event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
```

## Math
- Payout for winner: amount + amount * losing_pool_net / winning_pool
- Fee: fee_bps applied to losing_pool; fee sent to `treasury`.
- Use checked math; revert on overflow/underflow.

## Access Control
- Owner: can set `oracle`, `treasury`, `fee_bps`.
- Anyone can close after `closing_ts`.
- Only valid oracle signature permits resolution.

## Configuration
- Constants: MAX_OUTCOMES=2, DEFAULT_FEE_BPS=200
- Storage slots: markets map, bets map, counters, owner, oracle, treasury, fee_bps.

## Acceptance Tests
1. Create market, place bets on both sides, close, resolve with valid signature, claim winners; losers cannot claim.
2. Invalid signature rejected.
3. Fee collected equals bps of losing pool.
4. Re-entrancy guards around claim and bet.
5. Orbit gas costs lower than L2 for same flow (manual observation).

## Build & Deploy
- Build Stylus with `cargo stylus build`.
- Deploy to Arbitrum Sepolia Stylus testnet and Orbit chain; export addresses and ABI JSON.

## Artifacts Required by Integrations
- ABI JSON.
- Contract addresses per network.
- EIP-712 domain values.
- Owner/oracle/treasury addresses.
