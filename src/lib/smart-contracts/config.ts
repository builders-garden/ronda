import type { Address } from "viem";
import { env } from "../env";
import rondaProtocolAbi from "./abis/RondaProtocol.json";

// Contract ABI
export const RONDA_PROTOCOL_ABI = rondaProtocolAbi;

// Contract address - should be set via environment variable
export const RONDA_PROTOCOL_ADDRESS = (env.NEXT_PUBLIC_RONDA_FACTORY_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as Address;
