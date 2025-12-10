import { createSurfClient } from "@thalalabs/surf";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { KLASH_ABI } from "./abi";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(aptosConfig);

export const surfClient = createSurfClient(aptos).useABI(KLASH_ABI);
