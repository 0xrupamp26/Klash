/// @title Klash Configuration Module
/// @notice Handles contract configuration, versioning, and upgrade management
module klash::config {
    use std::signer;
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};

    // Error codes
    const ENOT_ADMIN: u64 = 0;
    const EALREADY_INITIALIZED: u64 = 1;
    const ENOT_INITIALIZED: u64 = 2;
    const EINVALID_TIMESTAMP: u64 = 3;
    const EINVALID_VERSION: u64 = 4;
    const EINSUFFICIENT_DELAY: u64 = 5;
    const EINVALID_PROPOSAL: u64 = 6;

    // Constants
    const PLATFORM_FEE_PERCENT: u64 = 200; // 2% in basis points (2 * 100)
    const MIN_BET: u64 = 100000; // 0.1 APT (assuming 6 decimals)
    const MAX_BET: u64 = 1000000000; // 1000 APT (assuming 6 decimals)
    const CONTRACT_VERSION: u64 = 1;
    const UPGRADE_DELAY: u64 = 86400; // 24 hours in seconds

    // Structs
    struct UpgradeProposal has store, copy, drop {
        new_version: u64,
        new_code_address: address,
        proposed_at: u64,
        executed: bool
    }

    struct Config has key {
        admin: address,
        pending_admin: address,
        version: u64,
        upgrade_proposals: Table<u64, UpgradeProposal>,
        next_proposal_id: u64,
    }

    // Events
    #[event]
    struct UpgradeProposedEvent has drop, store {
        proposal_id: u64,
        new_version: u64,
        new_code_address: address,
        proposed_at: u64,
    }

    #[event]
    struct UpgradeExecutedEvent has drop, store {
        proposal_id: u64,
        old_version: u64,
        new_version: u64,
        executed_at: u64,
    }

    #[event]
    struct AdminChangedEvent has drop, store {
        old_admin: address,
        new_admin: address,
    }

    // Initialize the configuration with the deployer as the initial admin
    public fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        
        // Check if already initialized
        assert!(!exists<Config>(account_addr), EALREADY_INITIALIZED);
        
        // Initialize config
        move_to(account, Config {
            admin: account_addr,
            pending_admin: account_addr,
            version: CONTRACT_VERSION,
            upgrade_proposals: table::new(),
            next_proposal_id: 1,
        });
    }

    // Propose an upgrade to a new version
    public entry fun propose_upgrade(
        admin: &signer,
        new_version: u64,
        new_code_address: address,
        delay_seconds: u64
    ) acquires Config {
        let config = borrow_global_mut<Config>(@klash);
        assert!(signer::address_of(admin) == config.admin, ENOT_ADMIN);
        assert!(delay_seconds >= UPGRADE_DELAY, EINSUFFICIENT_DELAY);
        
        let proposal_id = config.next_proposal_id;
        let now = timestamp::now_seconds();
        
        // Add new proposal
        table::add(&mut config.upgrade_proposals, proposal_id, UpgradeProposal {
            new_version,
            new_code_address,
            proposed_at: now,
            executed: false
        });
        
        // Increment proposal ID
        config.next_proposal_id = config.next_proposal_id + 1;
        
        // Emit event
        event::emit(UpgradeProposedEvent {
            proposal_id,
            new_version,
            new_code_address,
            proposed_at: now,
        });
    }

    // Execute a proposed upgrade
    public entry fun execute_upgrade(
        admin: &signer,
        proposal_id: u64
    ) acquires Config {
        let config = borrow_global_mut<Config>(@klash);
        assert!(signer::address_of(admin) == config.admin, ENOT_ADMIN);
        
        let proposal = table::borrow_mut(&mut config.upgrade_proposals, proposal_id);
        assert!(!proposal.executed, EINVALID_PROPOSAL);
        
        let now = timestamp::now_seconds();
        let min_execution_time = proposal.proposed_at + UPGRADE_DELAY;
        assert!(now >= min_execution_time, EINVALID_TIMESTAMP);
        
        // Update version
        let old_version = config.version;
        config.version = proposal.new_version;
        
        // Mark as executed
        proposal.executed = true;
        
        // Emit event
        event::emit(UpgradeExecutedEvent {
            proposal_id,
            old_version,
            new_version: config.version,
            executed_at: now,
        });
    }

    // Get the current contract version
    public fun get_version(): u64 acquires Config {
        borrow_global<Config>(@klash).version
    }

    // Get the admin address
    public fun get_admin(): address acquires Config {
        borrow_global<Config>(@klash).admin
    }

    // Propose a new admin
    public entry fun transfer_admin(
        admin: &signer,
        new_admin: address
    ) acquires Config {
        let config = borrow_global_mut<Config>(@klash);
        assert!(signer::address_of(admin) == config.admin, ENOT_ADMIN);
        config.pending_admin = new_admin;
    }

    // Accept admin transfer
    public entry fun accept_admin(account: &signer) acquires Config {
        let account_addr = signer::address_of(account);
        let config = borrow_global_mut<Config>(@klash);
        
        assert!(account_addr == config.pending_admin, ENOT_ADMIN);
        
        // Emit event for admin change
        event::emit(AdminChangedEvent {
            old_admin: config.admin,
            new_admin: account_addr,
        });
        
        // Update admin
        config.admin = account_addr;
        config.pending_admin = account_addr;
    }

    // Verify if the caller is the admin
    public fun is_admin(caller: address): bool acquires Config {
        exists<Config>(@klash) && borrow_global<Config>(@klash).admin == caller
    }

    // Get the platform fee percentage (in basis points)
    public fun get_platform_fee_percent(): u64 {
        PLATFORM_FEE_PERCENT
    }

    // Get minimum bet amount
    public fun get_min_bet(): u64 {
        MIN_BET
    }

    // Get maximum bet amount
    public fun get_max_bet(): u64 {
        MAX_BET
    }

    // Calculate platform fee (2% of amount)
    public fun calculate_platform_fee(amount: u64): u64 {
        (amount * PLATFORM_FEE_PERCENT) / 10000 // 10000 = 100% in basis points
    }
}
