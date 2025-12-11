import { createSurfClient } from "@thalalabs/surf";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { ABI } from "./abi";

const config = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(config);

export const surfClient = createSurfClient(aptos).useABI(ABI);
