---
name: pharos-guardian-agent
description: Orchestrates smart contract audits, EIP-1559 gas optimizations, and validator restaking profiling to autonomously manage wallet security and yields on Pharos. Use when requested to perform background threat scanning, manage stake distributions, or interact via natural language.
license: Apache-2.0
metadata:
  version: "1.0"
  author: "PharosSPNSentinel"
---

# Pharos Guardian Agent Skill

This skill implements an autonomous security & yield manager for user accounts and other AI agents on the Pharos Network. It composes token audits, gas optimizer, and validator staking checks into active on-chain protection loops.

## Capabilities

1. **Autonomous Threat sweeps**: Sweeps any incoming malicious tokens (contract safety score < 50/100) into safe USDC/PROS positions when gas is optimized.
2. **Autonomous Yield Rebalancer**: Stakes idle PROS funds to low-risk validators profiled through Blockscout Mainnet history and L1 Nakamoto coefficients.
3. **Interactive Chat**: Natural language interface providing on-demand scans and diagnostics.

## How to use

1. Trigger when the user wants to assess wallet security, setup auto-defends, rebalance yields, or run natural language audits.
2. Call `chatWithGuardianAgent` tool with the user's specific request.
3. Toggle background daemons using `toggleAutonomousFeature`.
4. Trigger manual contract audits or gas checks using `auditToken` and `estimateOptimalGas`.

## Operational Modes

- **Simulated Mode**: Default mode allowing instant simulation (swaps, stakes, threat injections) without real mainnet key configuration.
- **Live Mode**: Activated when `PRIVATE_KEY` is loaded into `.env` to execute actual Pharos transaction broadcasts.
