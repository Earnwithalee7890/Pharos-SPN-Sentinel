---
name: pharos-token-auditor
description: Audits on-chain smart contracts and tokens on Pharos Chain to detect rug pull risks, honeypots, hidden mint privileges, and proxy configurations. Use this before interacting with any unknown contract or token.
license: Apache-2.0
metadata:
  version: "1.0"
  author: "PharosSPNSentinel"
---

# Token Auditor Skill

This skill analyzes deployed smart contract bytecodes on the Pharos Network for malicious vulnerabilities and indicators before an agent makes on-chain transactions.

## How to use

1. Trigger when the agent receives an address to trade, swap, or interact with.
2. Call the `auditToken` tool with the contract address.
3. Review the safety score and warning flags (mint, blacklist, proxy, compiler metadata).
4. If the score is under 50 (DANGEROUS), abort or alert the user.

## Important Notes
- Standard wallet addresses (EOAs) have no bytecode and are marked with a 100% safety score.
- Opcodes corresponding to hidden minting or blacklisting decrease the safety rating.
- Upgradable proxies flag a warning since they can be replaced post-interaction.
