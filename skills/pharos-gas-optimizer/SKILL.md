---
name: pharos-gas-optimizer
description: Monitors Pharos Network gas prices and historical trends to optimize transaction timing and fees, factoring in the gas refund mechanism. Use when asked about the best time to execute a transaction or to estimate transaction costs.
license: Apache-2.0
metadata:
  version: "1.0"
  author: "PharosSPNScout"
---

# Gas Optimizer Skill

Calculates optimal gas parameters for Pharos Network transactions, accounting for the unique EIP-1559 gas refund mechanism.

## How to use

1. Trigger when user needs gas estimates or wants to optimize transaction timing.
2. Call the `estimateOptimalGas` tool.
3. Report the recommended max fee and network congestion level.

## Important Notes

- Pharos uses a gas refund mechanism. Always add a 20% buffer.
- Sub-second finality means most transactions confirm in ~1 second.
