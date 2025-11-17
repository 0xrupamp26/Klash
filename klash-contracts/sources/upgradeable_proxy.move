/// @title Upgradeable Proxy Module
/// @notice Implements the proxy pattern for upgradeable contracts
module klash::upgradeable_proxy {
    use std::signer;
    use aptos_framework::event;

    // Error codes
    const ENOT_ADMIN: u64 = 100;
    const EINVALID_IMPL: u64 = 101;
    const EINVALID_CALL: u64 = 102;

    // The proxy state that will be stored at the proxy address
    struct Proxy has key {
        implementation: address,
        admin: address,
    }

    // Event emitted when the implementation is changed
    #[event]
    struct Upgraded has drop, store {
        implementation: address,
    }

    // Initialize the proxy with an implementation address
    public fun initialize(account: &signer, implementation: address) {
        // Account existence check removed - accounts are created automatically
        assert!(implementation != @0x0, EINVALID_IMPL);
        
        let account_addr = signer::address_of(account);
        move_to(account, Proxy {
            implementation,
            admin: account_addr,
        });
    }

    // Upgrade the implementation address (only callable by admin)
    public entry fun upgrade(account: &signer, new_implementation: address) 
    acquires Proxy {
        let account_addr = signer::address_of(account);
        let proxy = borrow_global_mut<Proxy>(account_addr);
        
        assert!(proxy.admin == account_addr, ENOT_ADMIN);
        // Account existence check removed - accounts are created automatically
        assert!(new_implementation != @0x0, EINVALID_IMPL);
        
        // Update the implementation
        let _old_implementation = proxy.implementation;
        proxy.implementation = new_implementation;
        
        // Emit upgrade event
        event::emit(Upgraded {
            implementation: new_implementation,
        });
    }

    // Change the admin (only callable by current admin)
    public entry fun change_admin(account: &signer, new_admin: address) 
    acquires Proxy {
        let account_addr = signer::address_of(account);
        let proxy = borrow_global_mut<Proxy>(account_addr);
        
        assert!(proxy.admin == account_addr, ENOT_ADMIN);
        proxy.admin = new_admin;
    }

    // Get the current implementation address
    public fun get_implementation(proxy_address: address): address 
    acquires Proxy {
        borrow_global<Proxy>(proxy_address).implementation
    }

    // Get the admin address
    public fun get_admin(proxy_address: address): address 
    acquires Proxy {
        borrow_global<Proxy>(proxy_address).admin
    }

    // Set the implementation address
    public fun set_implementation(admin: &signer, new_impl: address) acquires Proxy {
        let proxy = borrow_global_mut<Proxy>(signer::address_of(admin));
        assert!(proxy.admin == signer::address_of(admin), ENOT_ADMIN);
        proxy.implementation = new_impl;
    }

    // Verify if the caller is the admin
    public fun is_admin(caller: address): bool 
    acquires Proxy {
        exists<Proxy>(caller) && borrow_global<Proxy>(caller).admin == caller
    }
}
