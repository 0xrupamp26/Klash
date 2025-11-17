module klash::allocation {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use std::string;

    // Error codes
    const E_MARKET_NOT_RESOLVED: u64 = 1;
    const E_NO_WINNERS: u64 = 2;
    const E_ALREADY_CLAIMED: u64 = 3;
    const E_INSUFFICIENT_BALANCE: u64 = 4;

    // Constants
    const PLATFORM_FEE_BPS: u64 = 200; // 2%
    const BPS_DENOMINATOR: u64 = 10000;

    // Structs
    struct MarketPool has key {
        market_id: vector<u8>,
        total_pool: u64,
        winning_pool: u64,
        losing_pool: u64,
        winning_outcome: u8,
        is_resolved: bool,
    }

    struct UserBet has key {
        user: address,
        market_id: vector<u8>,
        outcome: u8,
        amount: u64,
        claimed: bool,
    }

    // Calculate payout amount for a bet
    fun calculate_payout(
        bet_amount: u64,
        winning_pool: u64,
        losing_pool: u64
    ): u64 {
        if (winning_pool == 0) return 0;
        
        // Calculate platform fee
        let fee_amount = (losing_pool * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        let remaining_pool = losing_pool - fee_amount;
        
        // Calculate user's share of the pool
        let user_share = (bet_amount * remaining_pool) / winning_pool;
        bet_amount + user_share
    }

    // Initialize market pool
    public entry fun initialize_market_pool(
        admin: &signer,
        market_id: vector<u8>,
        total_pool: u64,
        winning_pool: u64,
        losing_pool: u64,
    ) {
        let market_addr = signer::address_of(admin);
        
        assert!(
            !exists<MarketPool>(market_addr),
            E_MARKET_NOT_RESOLVED
        );

        move_to(admin, MarketPool {
            market_id: copy market_id,
            total_pool,
            winning_pool,
            losing_pool,
            winning_outcome: 0,
            is_resolved: false,
        });
    }

    // Resolve market and allocate pools
    public entry fun resolve_and_allocate(
        admin: &signer,
        market_id: vector<u8>,
        winning_outcome: u8,
    ) acquires MarketPool {
        let market_addr = signer::address_of(admin);
        let market_pool = borrow_global_mut<MarketPool>(market_addr);

        assert!(
            market_pool.market_id == market_id,
            E_MARKET_NOT_RESOLVED
        );
        assert!(
            !market_pool.is_resolved,
            E_ALREADY_CLAIMED
        );

        market_pool.winning_outcome = winning_outcome;
        market_pool.is_resolved = true;
    }

    // Place a bet
    public entry fun place_bet(
        user: &signer,
        market_id: vector<u8>,
        outcome: u8,
        amount: u64,
    ) acquires UserBet, MarketPool {
        let user_addr = signer::address_of(user);
        
        // Check if bet already exists
        if (exists<UserBet>(user_addr)) {
            let bet = borrow_global_mut<UserBet>(user_addr);
            bet.amount = bet.amount + amount;
        } else {
            move_to(user, UserBet {
                user: user_addr,
                market_id: copy market_id,
                outcome,
                amount,
                claimed: false,
            });
        }

        // Update market pool
        let market_addr = signer::address_of(user);
        if (exists<MarketPool>(market_addr)) {
            let market_pool = borrow_global_mut<MarketPool>(market_addr);
            market_pool.total_pool = market_pool.total_pool + amount;
            market_pool.winning_pool = market_pool.winning_pool + amount;
        }
    }

    // Claim payout
    public entry fun claim_payout(
        user: &signer,
        market_id: vector<u8>,
    ) acquires MarketPool, UserBet {
        let user_addr = signer::address_of(user);
        let market_addr = signer::address_of(user);

        assert!(
            exists<MarketPool>(market_addr),
            E_MARKET_NOT_RESOLVED
        );

        let market_pool = borrow_global<MarketPool>(market_addr);
        assert!(
            market_pool.is_resolved,
            E_MARKET_NOT_RESOLVED
        );

        assert!(
            exists<UserBet>(user_addr),
            E_INSUFFICIENT_BALANCE
        );

        let bet = borrow_global_mut<UserBet>(user_addr);
        assert!(
            !bet.claimed,
            E_ALREADY_CLAIMED
        );

        assert!(
            bet.market_id == market_id,
            E_MARKET_NOT_RESOLVED
        );

        // Only winners can claim
        assert!(
            bet.outcome == market_pool.winning_outcome,
            E_INSUFFICIENT_BALANCE
        );

        let payout_amount = calculate_payout(
            bet.amount,
            market_pool.winning_pool,
            market_pool.losing_pool
        );

        // In a real implementation, transfer tokens here
        // coin::deposit(user_addr, coin::withdraw<AptosCoin>(market_addr, payout_amount));

        bet.claimed = true;
    }
}
