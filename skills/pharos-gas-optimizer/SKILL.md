---
name: pharos-gas-optimizer
description: Monitors Pharos Network gas prices and historical trends to optimize transaction timing and fees, factoring in the gas refund mechanism. Use this when asked about the best time to execute a transaction or to estimate transaction costs accurately.
license: Apache-2.0
metadata:
  version: "1.0"
  author: "PharosDeFiShield"
---

# Gas Optimizer Skill

This skill calculates optimal gas parameters for transactions on the Pharos Network. It understands Pharos' specific EIP-1559 implementation and gas refund logic.

## How to use

1. Trigger this skill when a user wants to know the best time to send a transaction, or needs an accurate gas estimate.
2. Use the `estimateOptimalGas` tool to get current recommendations.
3. The tool will return whether the current time window is `NOW`, `IN_5_MIN`, or `LATER`.

## Important Notes

- Pharos has high throughput, but gas optimization is still crucial for high-frequency or complex DeFi interactions.
- Always add a slight buffer (e.g., 20%) to the gas limit, as recommended by the Pharos documentation to avoid out-of-gas errors due to refund logic.
