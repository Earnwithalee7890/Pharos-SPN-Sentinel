import { parseUnits, formatUnits } from 'ethers';

/**
 * Validates if a string is a valid Ethereum/Pharos address.
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Pauses execution for a given number of milliseconds.
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Safely format an amount with decimals to a human readable string.
 */
export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  return formatUnits(amount, decimals);
}

/**
 * Safely parse a human readable string to a token amount (bigint).
 */
export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  return parseUnits(amount, decimals);
}
