import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { TokenAnalyzer } from '../services/token-analyzer';
import { GasMonitor } from '../services/gas-monitor';
import { SwapRouter } from '../services/swap-router';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize services
const tokenAnalyzer = new TokenAnalyzer();
const gasMonitor = new GasMonitor();
const swapRouter = new SwapRouter();

// Simple Swagger definition
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Pharos DeFi Shield API',
    version: '1.0.0',
    description: 'API for Pharos Network AI Agent Skills',
  },
  paths: {
    '/api/analyze-token': {
      post: {
        summary: 'Analyze Token Risk',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { tokenAddress: { type: 'string' } },
              },
            },
          },
        },
        responses: { '200': { description: 'Successful analysis' } },
      },
    },
    '/api/estimate-gas': {
      get: {
        summary: 'Estimate Optimal Gas',
        responses: { '200': { description: 'Successful estimation' } },
      },
    },
    '/api/execute-swap': {
      post: {
        summary: 'Execute or Simulate Swap',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  tokenIn: { type: 'string' },
                  tokenOut: { type: 'string' },
                  amount: { type: 'string' },
                  dryRun: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Successful execution' } },
      },
    },
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post('/api/analyze-token', async (req, res) => {
  try {
    const { tokenAddress } = req.body;
    if (!tokenAddress) return res.status(400).json({ error: 'tokenAddress required' });
    const result = await tokenAnalyzer.analyzeToken(tokenAddress);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/estimate-gas', async (req, res) => {
  try {
    const result = await gasMonitor.estimateOptimalGas();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/execute-swap', async (req, res) => {
  try {
    const { tokenIn, tokenOut, amount, dryRun = true } = req.body;
    if (!tokenIn || !tokenOut || !amount) {
       return res.status(400).json({ error: 'tokenIn, tokenOut, amount required' });
    }
    const result = await swapRouter.executeSwap(tokenIn, tokenOut, amount, dryRun);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Pharos DeFi Shield API running on http://localhost:${PORT}`);
  console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
});
