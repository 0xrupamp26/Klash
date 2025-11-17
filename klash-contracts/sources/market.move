/// @title Klash Market Module
/// @notice Implements the core prediction market functionality
module klash::market {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::coin::Self;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    
    use klash::config;

    // Error codes
    const ENOT_ADMIN: u64 = 200;
    const EINVALID_MARKET: u64 = 201;
    const EINVALID_OUTCOME: u64 = 202;
    const EINVALID_AMOUNT: u64 = 203;
    const EINVALID_STATE: u64 = 204;
    const EINSUFFICIENT_BALANCE: u64 = 205;
    const EINVALID_RESOLUTION: u64 = 206;
    const EALREADY_CLAIMED: u64 = 207;
    const EMARKET_CLOSED: u64 = 208;
    const EMARKET_NOT_CLOSED: u64 = 209;
    const EMARKET_NOT_RESOLVED: u64 = 210;
    const EINVALID_ORACLE: u64 = 211;

    // Market states
    const STATE_ACTIVE: u8 = 0;
    const STATE_CLOSED: u8 = 1;
    const STATE_RESOLVED: u8 = 2;
    const STATE_CANCELLED: u8 = 3;

    // Bet represents a user's bet on a market outcome
    struct Bet has key, copy, drop {
        amount: u64,
        outcome: u8,
        claimed: bool,
        created_at: u64,
    }

    // Market represents a prediction market
    struct Market has key, copy, drop {
        creator: address,
        description: String,
        outcomes: vector<String>,
        resolution: vector<u8>,
        total_bets: vector<u64>,
        state: u8,
        created_at: u64,
        closed_at: u64,
        resolved_at: u64,
        version: u64,
    }

    // Events
    #[event]
    struct MarketCreated has drop, store {
        market_id: address,
        creator: address,
        description: String,
        outcomes: vector<String>,
        created_at: u64,
    }

    #[event]
    struct BetPlaced has drop, store {
        market_id: address,
        better: address,
        amount: u64,
        outcome: u8,
        timestamp: u64,
    }

    #[event]
    struct MarketClosed has drop, store {
        market_id: address,
        closed_at: u64,
    }

    #[event]
    struct MarketResolved has drop, store {
        market_id: address,
        winning_outcome: u8,
        resolved_at: u64,
    }

    #[event]
    struct WinningsClaimed has drop, store {
        market_id: address,
        better: address,
        amount: u64,
        claimed_at: u64,
    }

    // Initialize a new market
    public entry fun create_market(
        creator: &signer,
        description: String,
        outcomes: vector<String>,
    ) {
        let creator_addr = signer::address_of(creator);
        let now = timestamp::now_seconds();
        
        // Account creation is handled automatically by the blockchain
        
        let num_outcomes = vector::length(&outcomes);
        let zero_bets = vector[];
        let i = 0;
        while (i < num_outcomes) {
            vector::push_back(&mut zero_bets, 0);
            i = i + 1;
        };
        
        // Create market
        move_to(creator, Market {
            creator: creator_addr,
            description,
            outcomes,
            resolution: vector::empty(),
            total_bets: zero_bets,
            state: STATE_ACTIVE,
            created_at: now,
            closed_at: 0,
            resolved_at: 0,
            version: config::get_version(),
        });
        
        // Emit event
        event::emit(MarketCreated {
            market_id: creator_addr,
            creator: creator_addr,
            description,
            outcomes: outcomes,
            created_at: now,
        });
    }

    // Place a bet on a market outcome
    public entry fun place_bet<CoinType: store>(
        better: &signer,
        market_id: address,
        outcome: u8,
        amount: u64,
    ) acquires Market, Bet {
        let better_addr = signer::address_of(better);
        let market = borrow_global_mut<Market>(market_id);
        
        // Validate market state
        assert!(market.state == STATE_ACTIVE, EMARKET_CLOSED);
        assert!((outcome as u64) < vector::length(&market.outcomes), EINVALID_OUTCOME);
        assert!(amount >= config::get_min_bet(), EINVALID_AMOUNT);
        assert!(amount <= config::get_max_bet(), EINVALID_AMOUNT);
        
        // Deposit bet amount into contract (will be distributed to winners)
        let coins = coin::withdraw<CoinType>(better, amount);
        coin::deposit(market_id, coins);
        
        // Update market state
        let current_bets = vector::borrow_mut(&mut market.total_bets, (outcome as u64));
        *current_bets = *current_bets + amount;
        
        // Create or update bet
        if (!exists<Bet>(better_addr)) {
            move_to(better, Bet {
                amount,
                outcome,
                claimed: false,
                created_at: timestamp::now_seconds(),
            });
        } else {
            let bet = borrow_global_mut<Bet>(better_addr);
            bet.amount = bet.amount + amount;
            bet.outcome = outcome; // Update to latest outcome
        };
        
        // Emit event
        event::emit(BetPlaced {
            market_id,
            better: better_addr,
            amount,
            outcome,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Close the market (only callable by creator)
    public entry fun close_market(
        caller: &signer,
        market_id: address,
    ) acquires Market {
        let caller_addr = signer::address_of(caller);
        let market = borrow_global_mut<Market>(market_id);
        
        // Validate caller and market state
        assert!(market.creator == caller_addr, ENOT_ADMIN);
        assert!(market.state == STATE_ACTIVE, EINVALID_STATE);
        
        // Update market state
        market.state = STATE_CLOSED;
        market.closed_at = timestamp::now_seconds();
        
        // Emit event
        event::emit(MarketClosed {
            market_id,
            closed_at: market.closed_at,
        });
    }

    // Resolve the market with the winning outcome (only callable by oracle)
    public entry fun resolve_market(
        oracle: &signer,
        market_id: address,
        winning_outcome: u8,
        resolution: vector<u8>,
    ) acquires Market {
        let oracle_addr = signer::address_of(oracle);
        let market = borrow_global_mut<Market>(market_id);
        
        // Validate caller and market state
        assert!(market.creator == oracle_addr, ENOT_ADMIN);
        assert!(market.state == STATE_CLOSED, EMARKET_NOT_CLOSED);
        assert!((winning_outcome as u64) < vector::length(&market.outcomes), EINVALID_OUTCOME);
        
        // Update market state
        market.state = STATE_RESOLVED;
        market.resolution = resolution;
        market.resolved_at = timestamp::now_seconds();
        
        // Emit event
        event::emit(MarketResolved {
            market_id,
            winning_outcome,
            resolved_at: market.resolved_at,
        });
    }

    // Claim winnings from a resolved market
    public entry fun claim_winnings<CoinType: store>(
        better: &signer,
        market_id: address,
    ) acquires Market, Bet {
        let better_addr = signer::address_of(better);
        let market = borrow_global<Market>(market_id);
        let bet = borrow_global_mut<Bet>(better_addr);
        
        // Validate market and bet state
        assert!(market.state == STATE_RESOLVED, EMARKET_NOT_RESOLVED);
        assert!(!bet.claimed, EALREADY_CLAIMED);
        
        // Mark as claimed
        bet.claimed = true;
        
        // Calculate winnings (simplified - actual calculation would use the resolution)
        let winning_amount = calculate_winnings(market, bet);
        
        // Transfer winnings to better
        // Note: In a real implementation, you would transfer coins from the market's escrow
        
        // Emit event
        event::emit(WinningsClaimed {
            market_id,
            better: better_addr,
            amount: winning_amount,
            claimed_at: timestamp::now_seconds(),
        });
    }

    // Calculate winnings for a bet (simplified)
    fun calculate_winnings(_market: &Market, bet: &Bet): u64 {
        // Simplified calculation - in a real implementation, this would use the market's resolution
        // and the actual bet amounts to calculate the correct winnings
        bet.amount * 2 // Example: 2x return for winning bets
    }

    // Get market details
    public fun get_market(market_id: address): Market acquires Market {
        *borrow_global<Market>(market_id)
    }

    // Get a user's bet on a market
    public fun get_bet(better: address): Bet acquires Bet {
        *borrow_global<Bet>(better)
    }

    // Check if a market is active
    public fun is_active(market_id: address): bool acquires Market {
        let market = borrow_global<Market>(market_id);
        market.state == STATE_ACTIVE
    }

    // Check if a market is resolved
    public fun is_resolved(market_id: address): bool acquires Market {
        let market = borrow_global<Market>(market_id);
        market.state == STATE_RESOLVED
    }
}
