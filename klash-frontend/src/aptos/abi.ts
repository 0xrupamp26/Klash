export const KLASH_ABI = {
    address: "0xf91de408f7f59f661f28aa2ebbb086bba63a846856954191877d6f8768e8f138",
    name: "market",
    friends: [],
    exposed_functions: [
        {
            name: "create_market",
            visibility: "public",
            is_entry: true,
            is_view: false,
            generic_type_params: [],
            params: ["&signer", "0x1::string::String", "vector<0x1::string::String>"],
            return: []
        },
        {
            name: "place_bet",
            visibility: "public",
            is_entry: true,
            is_view: false,
            generic_type_params: [{ constraints: ["store"] }],
            params: ["&signer", "address", "u8", "u64"],
            return: []
        },
        {
            name: "resolve_market",
            visibility: "public",
            is_entry: true,
            is_view: false,
            generic_type_params: [],
            params: ["&signer", "address", "u8", "vector<u8>"],
            return: []
        },
        {
            name: "get_market",
            visibility: "public",
            is_entry: false,
            is_view: true,
            generic_type_params: [],
            params: ["address"],
            return: [
                {
                    name: "Market",
                    layout: {
                        struct: {
                            name: "Market",
                            module_name: "market",
                            address: "0xf91de408f7f59f661f28aa2ebbb086bba63a846856954191877d6f8768e8f138",
                            fields: [
                                { name: "creator", type: "address" },
                                { name: "description", type: "0x1::string::String" },
                                { name: "outcomes", type: "vector<0x1::string::String>" },
                                { name: "resolution", type: "vector<u8>" },
                                { name: "total_bets", type: "vector<u64>" },
                                { name: "state", type: "u8" },
                                { name: "created_at", type: "u64" },
                                { name: "closed_at", type: "u64" },
                                { name: "resolved_at", type: "u64" },
                                { name: "version", type: "u64" }
                            ]
                        }
                    }
                }
            ]
        }
    ],
    structs: [
        {
            name: "Market",
            is_native: false,
            abilities: ["key", "copy", "drop"],
            generic_type_params: [],
            fields: [
                { name: "creator", type: "address" },
                { name: "description", type: "0x1::string::String" },
                { name: "outcomes", type: "vector<0x1::string::String>" },
                { name: "resolution", type: "vector<u8>" },
                { name: "total_bets", type: "vector<u64>" },
                { name: "state", type: "u8" },
                { name: "created_at", type: "u64" },
                { name: "closed_at", type: "u64" },
                { name: "resolved_at", type: "u64" },
                { name: "version", type: "u64" }
            ]
        }
    ]
} as const;
