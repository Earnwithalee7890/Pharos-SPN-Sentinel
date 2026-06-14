---
name: pharos-validator-trust
description: Evaluates validator trust levels on Pharos Chain by analyzing L1 node distribution (decentralization score) and checking operator balance, history, and block production on Ethereum Mainnet using Blockscout. Use when deciding where to stake, delegate, or allocate restaking assets.
license: Apache-2.0
metadata:
  version: "1.0"
  author: "PharosSPNSentinel"
---

# Validator Trust Skill

This skill allows agents to evaluate L1 validator concentration risks on the Pharos Network and check operator reputations on Ethereum Mainnet via the Blockscout PRO API.

## How to use

1. Trigger when the agent wants to restake, stake, or profile validator node safety.
2. Call the `getValidatorTrust` tool with the validator's address.
3. Review the L1 decentralization score, Nakamoto Coefficient, and the validator's Ethereum profile.
4. Compare EVM gas prices across networks.
5. Provide a staking delegation recommendation (SAFE / CAUTION / DANGEROUS).
