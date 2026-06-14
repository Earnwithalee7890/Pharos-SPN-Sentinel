---
name: pharos-swap-executor
description: Executes or simulates token swaps on Pharos Network decentralized exchanges with built-in safety and slippage checks. Use this when a user wants to swap or trade tokens.
license: Apache-2.0
metadata:
  version: "1.0"
  author: "PharosDeFiShield"
---

# Swap Executor Skill

This skill is a composable action that relies on `pharos-token-guardian` and `pharos-gas-optimizer`. It allows the safe execution of token swaps.

## How to use

1. Trigger this skill when the user requests a token swap (e.g., "Swap 10 USDC for WPROS").
2. Before calling the `executeSwap` tool, you should ideally invoke the `analyzeTokenRisk` tool on the destination token if it is unknown.
3. Call the `executeSwap` tool. You can use the `dryRun: true` parameter to simulate the swap before executing it live.

## Important Notes

- Never execute a live swap (`dryRun: false`) unless the user explicitly confirms the transaction after seeing the dry-run results.
- Always provide the user with the estimated gas cost and price impact.
