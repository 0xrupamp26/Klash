# PRD: Orbit L3 KlashChain

- **Module Name**: orbit-klashchain
- **Goal**: Stand up an Orbit chain optimized for micro-bets and demo Stylus contract with better UX (fees/latency) than L2.

## Functional Scope
- Launch Orbit (Nitro) devnet with Stylus enabled.
- Configure custom gas token ($KLASH) and faucet.
- Deploy ERC20 $KLASH and the Stylus market contract.
- Optional bridge from Arbitrum Sepolia to Orbit for $KLASH test token.

## Chain Config
- Chain ID: 777701 (example; to be set)
- RPC: http://localhost:8547 (dev)
- Sequencer: local dev sequencer
- Stylus: enabled
- Gas schedule: lower base fee suitable for small txs

## Required Components
- Orbit toolchain (Nitro)
- Deployer key (env)
- Token faucet (simple HTTP signer that mints test $KLASH)

## Deliverables
- Running RPC endpoint
- Addresses:
  - $KLASH ERC20
  - stylus-market contract
- Faucet endpoint URL and private key stored locally

## Acceptance Tests
1. Place bet on Orbit using stylus-market and confirm inclusion < 2s.
2. Compare gas used vs L2 for same bet; Orbit lower.
3. Claim payout works on Orbit.

## Outputs For Other Modules
- Network metadata JSON for frontend and backend:
```json
{
  "name": "KlashChain",
  "chainId": 777701,
  "rpcUrls": ["http://localhost:8547"],
  "contracts": {
    "stylusMarket": "0x...",
    "klashToken": "0x..."
  }
}
```
