import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { TokenAnalyzer } from "../services/token-analyzer";
import { GasMonitor } from "../services/gas-monitor";
import { SwapRouter } from "../services/swap-router";

// Initialize services
const tokenAnalyzer = new TokenAnalyzer();
const gasMonitor = new GasMonitor();
const swapRouter = new SwapRouter();

// Define server
const server = new Server(
  {
    name: "pharos-defi-shield",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tool schemas
const analyzeTokenRiskSchema = z.object({
  tokenAddress: z.string().describe("The Pharos address of the token to analyze"),
});

const executeSwapSchema = z.object({
  tokenIn: z.string().describe("Address of the token to sell"),
  tokenOut: z.string().describe("Address of the token to buy"),
  amount: z.string().describe("Amount of tokenIn to swap"),
  dryRun: z.boolean().default(true).describe("If true, simulates the swap without broadcasting"),
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyzeTokenRisk",
        description: "Analyzes a token contract for security risks and returns a safety score",
        inputSchema: {
          type: "object",
          properties: {
            tokenAddress: { type: "string" },
          },
          required: ["tokenAddress"],
        },
      },
      {
        name: "estimateOptimalGas",
        description: "Estimates the optimal gas price and timing for Pharos Network transactions",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "executeSwap",
        description: "Executes or simulates a token swap on Pharos DEX protocols",
        inputSchema: {
          type: "object",
          properties: {
            tokenIn: { type: "string" },
            tokenOut: { type: "string" },
            amount: { type: "string" },
            dryRun: { type: "boolean" },
          },
          required: ["tokenIn", "tokenOut", "amount"],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "analyzeTokenRisk": {
        const args = analyzeTokenRiskSchema.parse(request.params.arguments);
        const result = await tokenAnalyzer.analyzeToken(args.tokenAddress);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "estimateOptimalGas": {
        const result = await gasMonitor.estimateOptimalGas();
        const report = await gasMonitor.formatGasReport(result);
        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
            { type: "text", text: report }
          ],
        };
      }

      case "executeSwap": {
        const args = executeSwapSchema.parse(request.params.arguments);
        const result = await swapRouter.executeSwap(args.tokenIn, args.tokenOut, args.amount, args.dryRun);
        const report = swapRouter.formatSwapReport(result);
        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
            { type: "text", text: report }
          ],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Pharos DeFi Shield MCP Server running on stdio");
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
