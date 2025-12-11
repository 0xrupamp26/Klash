/// Klash - Minimal 2-Player Market
module klash::simple_market {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;

    /// Market doesn't exist
    const EMARKET_NOT_FOUND: u64 = 1;
    /// Invalid outcome
    const EINVALID_OUTCOME: u64 = 2;
    /// Market is full
    const EMARKET_FULL: u64 = 3;
    /// Already resolved
    const EALREADY_RESOLVED: u64 = 4;

    struct TwoPlayerMarket has key {
        player1: address,
        player1_outcome: u8,
        player1_amount: u64,
        player2: address,
        player2_outcome: u8,
        player2_amount: u64,
        resolved: bool,
        winner: u8, // 0 or 1
    }

    #[event]
    struct BetPlaced has drop, store {
        market: address,
        player: address,
        outcome: u8,
        amount: u64,
    }

    #[event]
    struct MarketResolved has drop, store {
        market: address,
        winner: u8,
    }

    /// Initialize a new 2-player market
    public entry fun create_market(creator: &signer) {
        let creator_addr = signer::address_of(creator);
        
        move_to(creator, TwoPlayerMarket {
            player1: @0x0,
            player1_outcome: 0,
            player1_amount: 0,
            player2: @0x0,
            player2_outcome: 0,
            player2_amount: 0,
            resolved: false,
            winner: 0,
        });
    }

    /// Place bet (first or second player)
    public entry fun place_bet(
        player: &signer,
        market_addr: address,
        outcome: u8,
        amount: u64
    ) acquires TwoPlayerMarket {
        assert!(outcome <= 1, EINVALID_OUTCOME);
        assert!(exists<TwoPlayerMarket>(market_addr), EMARKET_NOT_FOUND);
        
        let player_addr = signer::address_of(player);
        let market = borrow_global_mut<TwoPlayerMarket>(market_addr);
        
        assert!(!market.resolved, EALREADY_RESOLVED);

        // Withdraw coins from player
        let coins = coin::withdraw<AptosCoin>(player, amount);
        coin::deposit(market_addr, coins);

        if (market.player1 == @0x0) {
            // First player
            market.player1 = player_addr;
            market.player1_outcome = outcome;
            market.player1_amount = amount;
        } else if (market.player2 == @0x0) {
            // Second player
            market.player2 = player_addr;
            market.player2_outcome = outcome;
            market.player2_amount = amount;
        } else {
            abort EMARKET_FULL
        };

        event::emit(BetPlaced {
            market: market_addr,
            player: player_addr,
            outcome,
            amount,
        });
    }

    /// Resolve market (callable by market creator)
    public entry fun resolve_market(
        creator: &signer,
        market_addr: address,
        winning_outcome: u8
    ) acquires TwoPlayerMarket {
        assert!(signer::address_of(creator) == market_addr, EMARKET_NOT_FOUND);
        assert!(exists<TwoPlayerMarket>(market_addr), EMARKET_NOT_FOUND);
        
        let market = borrow_global_mut<TwoPlayerMarket>(market_addr);
        assert!(!market.resolved, EALREADY_RESOLVED);
        
        market.resolved = true;
        market.winner = winning_outcome;

        // Calculate payouts (2% fee)
        let total_pool = market.player1_amount + market.player2_amount;
        let fee = (total_pool * 2) / 100;
        let winner_payout = total_pool - fee;

        // Determine winner and transfer
        if (market.player1_outcome == winning_outcome && market.player2_outcome != winning_outcome) {
            // Player 1 wins
            let payout_coins = coin::withdraw<AptosCoin>(creator, winner_payout);
            coin::deposit(market.player1, payout_coins);
        } else if (market.player2_outcome == winning_outcome && market.player1_outcome != winning_outcome) {
            // Player 2 wins
            let payout_coins = coin::withdraw<AptosCoin>(creator, winner_payout);
            coin::deposit(market.player2, payout_coins);
        } else {
            // Both same side or invalid - refund both
            let p1_coins = coin::withdraw<AptosCoin>(creator, market.player1_amount);
            coin::deposit(market.player1, p1_coins);
            let p2_coins = coin::withdraw<AptosCoin>(creator, market.player2_amount);
            coin::deposit(market.player2, p2_coins);
        };

        event::emit(MarketResolved {
            market: market_addr,
            winner: winning_outcome,
        });
    }

    /// Check if market is full (2 players)
    public fun is_full(market_addr: address): bool acquires TwoPlayerMarket {
        if (!exists<TwoPlayerMarket>(market_addr)) return false;
        let market = borrow_global<TwoPlayerMarket>(market_addr);
        market.player2 != @0x0
    }

    /// Check if market is resolved
    public fun is_resolved(market_addr: address): bool acquires TwoPlayerMarket {
        if (!exists<TwoPlayerMarket>(market_addr)) return false;
        let market = borrow_global<TwoPlayerMarket>(market_addr);
        market.resolved
    }
}
