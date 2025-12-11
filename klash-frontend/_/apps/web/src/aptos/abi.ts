export const ABI = {
    address: "0xf91de408f7f59f661f28aa2ebbb086bba63a846856954191877d6f8768e8f138",
    name: "market",
    friends: [],
    exposed_functions: [
        {
            name: "place_bet",
            visibility: "public",
            is_entry: true,
            is_view: false,
            generic_type_params: [{ constraints: [] }],
            params: ["address", "u8", "u64"],
            return: []
        },
        {
            name: "resolve_market",
            visibility: "public",
            is_entry: true,
            is_view: false,
            generic_type_params: [],
            params: ["address", "u8"],
            return: []
        }
    ],
    structs: []
} as const;
