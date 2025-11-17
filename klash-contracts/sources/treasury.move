/// @title Klash Treasury Module
/// @notice Handles platform fee collection and distribution
module klash::treasury {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use klash::config;

    // Error codes
    const ENOT_ADMIN: u64 = 300;
    const EINSUFFICIENT_BALANCE: u64 = 301;
    const EINVALID_AMOUNT: u64 = 302;
    const ENOT_INITIALIZED: u64 = 303;
    const EALREADY_INITIALIZED: u64 = 304;

    // Treasury state
    struct Treasury has key {
        total_fees_collected: u64,
        total_fees_withdrawn: u64,
        admin: address,
        version: u64,
    }

    // Events
    #[event]
    struct FeesCollected has drop, store {
        amount: u64,
        from: address,
        timestamp: u64,
    }

    #[event]
    struct FeesWithdrawn has drop, store {
        amount: u64,
        to: address,
        timestamp: u64,
    }

    #[event]
    struct AdminChanged has drop, store {
        old_admin: address,
        new_admin: address,
    }

    // Initialize the treasury
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        // Check if already initialized
        assert!(!exists<Treasury>(admin_addr), EALREADY_INITIALIZED);
        
        // Create treasury
        move_to(admin, Treasury {
            total_fees_collected: 0,
            total_fees_withdrawn: 0,
            admin: admin_addr,
            version: config::get_version(),
        });
    }

    // Deposit fees to the treasury
    public entry fun deposit_fees<CoinType: store>(
        from: &signer,
        amount: u64,
    ) acquires Treasury {
        let from_addr = signer::address_of(from);
        
        // Get treasury
        let treasury = borrow_global_mut<Treasury>(from_addr);
        
        // Transfer coins from sender to treasury
        let fees = coin::withdraw<CoinType>(from, amount);
        coin::deposit(signer::address_of(from), fees);
        
        // Update treasury state
        treasury.total_fees_collected = treasury.total_fees_collected + amount;
        
        // Emit event
        event::emit(FeesCollected {
            amount,
            from: from_addr,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Withdraw fees from the treasury (admin only)
    public entry fun withdraw_fees<CoinType: store>(
        admin: &signer,
        to: address,
        amount: u64,
    ) acquires Treasury {
        let admin_addr = signer::address_of(admin);
        let treasury = borrow_global_mut<Treasury>(admin_addr);
        
        // Validate admin
        assert!(treasury.admin == admin_addr, ENOT_ADMIN);
        
        // Validate amount
        assert!(amount > 0, EINVALID_AMOUNT);
        
        // In a real implementation, you would transfer the coins here
        // For now, we'll just update the state
        treasury.total_fees_withdrawn = treasury.total_fees_withdrawn + amount;
        
        // Emit event
        event::emit(FeesWithdrawn {
            amount,
            to,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Change the admin (only callable by current admin)
    public entry fun change_admin(
        admin: &signer,
        new_admin: address,
    ) acquires Treasury {
        let admin_addr = signer::address_of(admin);
        let treasury = borrow_global_mut<Treasury>(admin_addr);
        
        // Validate admin
        assert!(treasury.admin == admin_addr, ENOT_ADMIN);
        
        // Emit event
        event::emit(AdminChanged {
            old_admin: admin_addr,
            new_admin,
        });
        
        // Update admin
        treasury.admin = new_admin;
    }

    // Get the current admin
    public fun get_admin(): address 
    acquires Treasury {
        let admin_addr = @klash; // Default to contract address
        if (exists<Treasury>(admin_addr)) {
            admin_addr = borrow_global<Treasury>(admin_addr).admin;
        };
        admin_addr
    }

    // Get total fees collected
    public fun get_total_fees_collected(): u64 
    acquires Treasury {
        if (exists<Treasury>(@klash)) {
            borrow_global<Treasury>(@klash).total_fees_collected
        } else {
            0
        }
    }

    // Get total fees withdrawn
    public fun get_total_fees_withdrawn(): u64 
    acquires Treasury {
        if (exists<Treasury>(@klash)) {
            borrow_global<Treasury>(@klash).total_fees_withdrawn
        } else {
            0
        }
    }

    // Get available balance (collected - withdrawn)
    public fun get_available_balance(): u64 
    acquires Treasury {
        if (exists<Treasury>(@klash)) {
            let treasury = borrow_global<Treasury>(@klash);
            treasury.total_fees_collected - treasury.total_fees_withdrawn
        } else {
            0
        }
    }
}
