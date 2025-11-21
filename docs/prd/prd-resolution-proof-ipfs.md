# PRD: Resolution Proof + IPFS

- **Module Name**: resolution-proof-ipfs
- **Goal**: Produce verifiable AI resolution artifacts (JSON), pin to IPFS, and bind proof onchain via EIP-712.

## Inputs
- Tweet ID and replies (from `twitter-controversy.service.ts`)
- Sentiment analysis summary: positive, negative, neutral, sampleSize, modelId, outcome

## Process
1. Build JSON artifact:
```json
{
  "tweetId": "123",
  "modelId": "hf-cardiffnlp/twitter-roberta-base-sentiment",
  "sampleSize": 250,
  "positive": 0.62,
  "negative": 0.28,
  "neutral": 0.10,
  "outcome": "POSITIVE",
  "timestamp": 1732230000
}
```
2. Compute `keccak256(utf8(json))` -> `analysisHash`.
3. Pin JSON to IPFS -> `analysisCid` (ipfs://...).
4. Build EIP-712 `Resolution` and sign with oracle key.
5. Call `resolve_market(marketId, winning, analysisHash, analysisCid, sig)`.

## Backend Additions
- Utility `hashJson(json: any): string`
- `pinToIpfs(json: any): Promise<string>` using Web3.Storage or Pinata.
- Oracle signer using `ethers.Wallet(ARB_RESOLVER_KEY)`

## Contract Expectations
- Verify signature matches stored `oracle`.
- Persist `analysisHash` and `analysisCid` per market.

## Acceptance Tests
1. Hash reproducibility: same JSON -> same `analysisHash`.
2. Signature verification fails on altered JSON/CID.
3. Contract emits `MarketResolved` with provided hash+cid.
