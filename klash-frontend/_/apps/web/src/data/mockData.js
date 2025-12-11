export const mockControversies = [
  {
    id: "1",
    title: "Will Bitcoin hit $100k before June 2025?",
    description:
      "Bitcoin has been consolidating around $95k. Will it break the psychological $100k barrier before the end of June 2025?",
    sideA: "Yes, BTC hits $100k",
    sideB: "No, stays below $100k",
    status: "open",
    closeTime: "2025-06-30T23:59:59Z",
    totalStakeA: 0,
    totalStakeB: 0,
    currentBets: [],
  },
  {
    id: "2",
    title:
      "Will Ethereum merge to Proof of Stake 2.0 succeed without rollback?",
    description:
      "The next major Ethereum upgrade is coming. Will it launch smoothly without any network rollback?",
    sideA: "Yes, smooth launch",
    sideB: "No, rollback needed",
    status: "waiting",
    closeTime: "2025-12-31T23:59:59Z",
    totalStakeA: 50,
    totalStakeB: 0,
    currentBets: [
      {
        id: "bet1",
        marketId: "2",
        side: "A",
        amount: 50,
        walletAddress: "0xabc123",
        status: "pending",
      },
    ],
  },
  {
    id: "3",
    title: "Will Solana have 24hrs of zero downtime in Q1 2025?",
    description:
      "Solana has faced network outages in the past. Can it maintain 100% uptime for 24 consecutive hours in Q1 2025?",
    sideA: "Yes, 24hrs uptime",
    sideB: "No, will go down",
    status: "resolved",
    closeTime: "2025-03-31T23:59:59Z",
    totalStakeA: 100,
    totalStakeB: 100,
    winner: "A",
    currentBets: [
      {
        id: "bet2",
        marketId: "3",
        side: "A",
        amount: 100,
        walletAddress: "0xdef456",
        status: "won",
        payout: 196,
        fee: 4,
      },
      {
        id: "bet3",
        marketId: "3",
        side: "B",
        amount: 100,
        walletAddress: "0xghi789",
        status: "lost",
        payout: 0,
        fee: 0,
      },
    ],
  },
  {
    id: "4",
    title: "Will a major DeFi protocol get hacked in 2025?",
    description:
      "DeFi hacks have been a recurring issue. Will any top-10 DeFi protocol (by TVL) suffer a hack resulting in $10M+ loss in 2025?",
    sideA: "Yes, hack happens",
    sideB: "No, all secure",
    status: "open",
    closeTime: "2025-12-31T23:59:59Z",
    totalStakeA: 0,
    totalStakeB: 0,
    currentBets: [],
  },
];

export const mockPortfolio = [
  {
    id: "bet2",
    marketId: "3",
    side: "A",
    amount: 100,
    walletAddress: "0xdef456",
    status: "won",
    payout: 196,
    fee: 4,
  },
];
