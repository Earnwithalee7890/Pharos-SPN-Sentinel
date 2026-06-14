# Architecture: Pharos SPN Sentinel

## Skill & Agent Orchestration Flow

```
                     ┌───────────────────────────┐
                     │    User Chat / Toggles    │
                     └─────────────┬─────────────┘
                                   │ HTTPS / WS
                                   ▼
                     ┌───────────────────────────┐
                     │   Pharos Guardian Agent   │
                     │  (Wallet & Decision Logic)│
                     └─────────────┬─────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
        Token Auditor        Gas Optimizer       Validator Trust
      (Bytecode Scanner)   (Refund Buffer)    (Blockscout Profiler)
              │                    │                    │
              └───────────┬────────┴────────────┬───────┘
                          │                     │
                          ▼                     ▼
                     Pharos L1 RPC       Blockscout PRO
                    (rpc.pharos.xyz)        API (ETH)
```

The **Pharos SPN Sentinel** demonstrates **composability**—the Guardian Agent runs in the background and calls the Network, Gas, and Auditor skills to make autonomous decisions (Auto-Defend and Auto-Stake), while also exposing direct MCP interfaces for external agents and Swagger HTTP endpoints for traditional apps.

---

## Pharos-Specific Features

1. **Autonomous Asset Defend**: Automatically checks incoming token bytecodes for dangerous properties and exits the position if risk is high.
2. **Gas Refund Buffer**: Integrates Pharos' EIP-1559 gas-refund mechanism with an automatic 20% calculation buffer to prevent out-of-gas errors while optimizing costs.
3. **SPN Restaking Profiler**: Analyzes validator node decentralization (Nakamoto Coefficient) and cross-chain reputation (via Ethereum Blockscout) to ensure safe restaking delegations.
4. **Interactive Dashboard**: Modern glassmorphic panel rendering real-time background logs and terminal execution.

---

## CertiK Skill Scanner Compliance

To ensure compliance with the **CertiK Skill Scanner** (the hackathon's core security audit standard), the codebase adheres to strict security rules:
- **✅ No Shell Execution**: Uses pure ethers.js and standard JS libraries; no `child_process`, `exec`, or shell calls are made.
- **✅ No Local File Writes**: The daemon, server, and skills operate entirely in-memory and write no local system files during execution.
- **✅ Strict Input Validation**: Uses standard JS regex and Ethers' `isAddress` utilities to validate EVM addresses before running audits or profiling.
- **✅ Controlled Outbound Calls**: Network calls are strictly limited to the secure Pharos L1 RPC and the secure Blockscout PRO API endpoints.
- **✅ Stateless execution**: The MCP tools and API servers run state-free, utilizing in-memory structures only.
