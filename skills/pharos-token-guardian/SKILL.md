---
name: pharos-token-guardian
description: Analyzes Pharos token contracts for security risks (honeypots, rug pulls, hidden mints) and provides a safety score. Use this before interacting with any unknown tokens or when asked to evaluate a token's safety.
license: Apache-2.0
metadata:
  version: "1.0"
  author: "PharosDeFiShield"
---

# Token Guardian Skill

This skill allows an agent to analyze a token's smart contract on the Pharos Network for potential security vulnerabilities.

## How to use

1. Trigger this skill when the user asks about the safety, security, or risk of a specific token address.
2. Ensure you have the exact token contract address.
3. Call the `analyzeTokenRisk` tool provided by the MCP server.
4. Interpret the `riskScore` and `details` to give the user a clear `BUY`, `CAUTION`, or `AVOID` recommendation.

## Important Notes

- Do not attempt to execute code to analyze the contract manually; rely on the `analyzeTokenRisk` tool.
- A risk score > 70 generally means `AVOID`.
- A risk score between 30 and 70 means `CAUTION`.
- Always remind the user that this analysis is an automated tool and not financial advice.
