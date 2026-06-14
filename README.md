# 🛡️ Pharos DeFi Shield (Skill-to-Agent Hackathon)

**A suite of 3 highly-composable AI Agent Skills built for the Pharos Agent Carnival.**

Pharos DeFi Shield is designed to give AI Agents on the Pharos Network the ability to intelligently analyze token risk, optimize gas for the Pharos EIP-1559 implementation, and execute safe token swaps.

## 🌟 The Skills

1. **`pharos-token-guardian`**: Analyzes token smart contracts for honeypots, hidden mints, proxy risks, and poor liquidity. Returns a Risk Score (0-100) and recommendation (BUY/CAUTION/AVOID).
2. **`pharos-gas-optimizer`**: Monitors Pharos gas prices and calculates the optimal `maxFeePerGas` including the recommended buffer for Pharos' unique gas refund mechanism.
3. **`pharos-swap-executor`**: Composes the above two skills to perform safe token swaps. It verifies token safety and optimizes gas before executing. Includes a robust dry-run simulation mode.

## 🛠️ Tech Stack & Integration
- **Frameworks**: TypeScript, Node.js, Express, `pharos-agent-kit`, `@modelcontextprotocol/sdk`
- **Network**: Native Pharos RPC integration (Mainnet: 1672)
- **Security**: Built to pass the **CertiK Skill Scanner** (Zero malicious behavior, strict schema validation, no shell execution).
- **Standards**: Uses the official `SKILL.md` open standard and MCP (Model Context Protocol).

## 🚀 Quick Start

### 1. Setup
\`\`\`bash
npm install
cp .env.example .env
# Edit .env to add your Pharos Wallet Private Key
\`\`\`

### 2. Run the MCP Server
This exposes the 3 skills as tools for AI clients (like Claude Desktop or Cursor).
\`\`\`bash
npx ts-node src/mcp/server.ts
\`\`\`

### 3. Run the REST API & Swagger UI
This exposes the skills as standard HTTP endpoints.
\`\`\`bash
npx ts-node src/api/server.ts
# Open http://localhost:3000/api-docs in your browser
\`\`\`

### 4. Run Skills Directly via CLI
\`\`\`bash
# 1. Token Guardian
npx ts-node skills/pharos-token-guardian/scripts/index.ts <token_address>

# 2. Gas Optimizer
npx ts-node skills/pharos-gas-optimizer/scripts/index.ts

# 3. Swap Executor (Simulated)
npx ts-node skills/pharos-swap-executor/scripts/index.ts <tokenIn> <tokenOut> <amount>
\`\`\`

## 📚 Documentation
See the [ARCHITECTURE.md](./docs/ARCHITECTURE.md) file for a deep dive into how the skills communicate and the project's adherence to the Pharos vision.

## 🏆 Hackathon Alignment
- **Dual Cascade Phase 1**: We provide 3 distinct, reusable skills.
- **Phase 2 Readiness**: The `pharos-swap-executor` demonstrates composition, making this project the perfect foundation for a complete Agent in Phase 2.
- **Real-World Impact**: Directly mitigates the highest risk in DeFi (rug pulls/scams).
