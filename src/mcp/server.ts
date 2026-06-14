import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { TokenAuditor } from "../services/token-auditor";
import { GasMonitor } from "../services/gas-monitor";
import { ValidatorTrust } from "../services/validator-trust";
import { GuardianAgent } from "../services/guardian-agent";

const tokenAuditor = new TokenAuditor();
const gasMonitor = new GasMonitor();
const validatorTrust = new ValidatorTrust();
const agent = GuardianAgent.getInstance();

const server = new Server(
  { name: "pharos-spn-sentinel", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "auditToken",
      description: "Audit any smart contract or token on Pharos Chain to detect Honeypot, proxy status, and security indicators",
      inputSchema: {
        type: "object",
        properties: {
          address: { type: "string", description: "The token or contract address to audit" },
        },
        required: ["address"],
      },
    },
    {
      name: "estimateOptimalGas",
      description: "Estimate optimal gas parameters for Pharos transactions including the 20% gas refund buffer",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "getValidatorTrust",
      description: "Evaluate validator trust by calculating Pharos L1 concentration/decentralization and profiling operator reputation on Ethereum via Blockscout PRO API",
      inputSchema: {
        type: "object",
        properties: {
          address: { type: "string", description: "The Ethereum/EVM wallet address of the validator to profile" },
          blockRange: { type: "number", description: "Number of recent blocks on Pharos to analyze (default: 50)" },
        },
        required: ["address"],
      },
    },
    {
      name: "chatWithGuardianAgent",
      description: "Send a message to the autonomous Pharos Guardian Agent to perform security scans, retrieve gas fees, or check wallet status",
      inputSchema: {
        type: "object",
        properties: {
          message: { type: "string", description: "The message or instruction for the agent" }
        },
        required: ["message"]
      }
    },
    {
      name: "toggleAutonomousFeature",
      description: "Enable or disable the Guardian Agent's autonomous loops (autoDefend or autoStake)",
      inputSchema: {
        type: "object",
        properties: {
          feature: { type: "string", enum: ["autoDefend", "autoStake"], description: "Feature name to toggle" },
          enabled: { type: "boolean", description: "Set true to activate, false to deactivate" }
        },
        required: ["feature", "enabled"]
      }
    },
    {
      name: "triggerSecuritySweep",
      description: "Instantly force the Guardian Agent to scan the wallet and execute autonomous swaps on any detected malicious tokens",
      inputSchema: { type: "object", properties: {} }
    }
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "auditToken": {
        const address = (request.params.arguments as any)?.address;
        if (!address) {
          throw new McpError(ErrorCode.InvalidParams, "Contract address is required");
        }
        const result = await tokenAuditor.auditToken(address);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "estimateOptimalGas": {
        const result = await gasMonitor.estimateOptimalGas();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "getValidatorTrust": {
        const address = (request.params.arguments as any)?.address;
        const blockRange = (request.params.arguments as any)?.blockRange || 50;
        if (!address) {
          throw new McpError(ErrorCode.InvalidParams, "Validator address is required");
        }
        const result = await validatorTrust.getValidatorTrust(address, blockRange);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "chatWithGuardianAgent": {
        const message = (request.params.arguments as any)?.message;
        if (!message) {
          throw new McpError(ErrorCode.InvalidParams, "Message content is required");
        }
        const reply = await agent.chat(message);
        return { content: [{ type: "text", text: reply }] };
      }
      case "toggleAutonomousFeature": {
        const feature = (request.params.arguments as any)?.feature;
        const enabled = !!(request.params.arguments as any)?.enabled;
        if (feature !== 'autoDefend' && feature !== 'autoStake') {
          throw new McpError(ErrorCode.InvalidParams, "Invalid feature. Must be autoDefend or autoStake");
        }
        agent.toggleFeature(feature, enabled);
        return { content: [{ type: "text", text: `Successfully toggled ${feature} to ${enabled ? 'ENABLED' : 'DISABLED'}.` }] };
      }
      case "triggerSecuritySweep": {
        await agent.runSecurityAuditAndDefend();
        return { content: [{ type: "text", text: "Security sweep check complete. Consult background logs for details." }] };
      }
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
    }
  } catch (error: any) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PharosSPNSentinel MCP Server running on stdio");
}

if (require.main === module) {
  main().catch((error) => { console.error("Server error:", error); process.exit(1); });
}
