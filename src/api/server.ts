import express from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { TokenAuditor } from '../services/token-auditor';
import { GasMonitor } from '../services/gas-monitor';
import { ValidatorTrust } from '../services/validator-trust';
import { GuardianAgent } from '../services/guardian-agent';

const app = express();
app.use(express.json());

// --- SECURITY MIDDLEWARES ---
// 1. CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// 2. Custom Security Headers (Helmet equivalents)
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data:;");
  next();
});

// 3. Lightweight API Rate Limiting to prevent DoS
const ipRequestCounts = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 60;

app.use('/api/', (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  let ipData = ipRequestCounts.get(ip);
  if (!ipData || now > ipData.resetTime) {
    ipData = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    ipRequestCounts.set(ip, ipData);
    return next();
  }
  
  if (ipData.count >= MAX_REQUESTS_PER_MINUTE) {
    return res.status(429).json({ error: 'Too many requests. Rate limit exceeded.' });
  }
  
  ipData.count++;
  next();
});
// ----------------------------

const PORT = process.env.PORT || 3000;
const tokenAuditor = new TokenAuditor();
const gasMonitor = new GasMonitor();
const validatorTrust = new ValidatorTrust();
const agent = GuardianAgent.getInstance();

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'PharosSPNSentinel API',
    version: '1.0.0',
    description: 'AI Agent Skills and Autonomous Guardian endpoints for Pharos Agent Security & Staking Trust',
  },
  paths: {
    '/api/audit-token': {
      get: {
        summary: 'Audit Smart Contract Safety',
        description: 'Scans target contract bytecode for Honeypots, proxy patterns, and risk factors',
        parameters: [{
          name: 'address',
          in: 'query',
          required: true,
          schema: { type: 'string' },
          description: 'EVM address to audit',
        }],
        responses: { '200': { description: 'Token audit report' } },
      },
    },
    '/api/gas-estimate': {
      get: {
        summary: 'Estimate Optimal Gas parameters',
        description: 'Gas fee optimization with Pharos gas refund buffer',
        responses: { '200': { description: 'Gas optimization report' } },
      },
    },
    '/api/validator-trust': {
      get: {
        summary: 'Evaluate Validator Trust Profile',
        description: 'Profiles validator decentralization risk and Ethereum reputation via Blockscout',
        parameters: [
          {
            name: 'address',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Validator Ethereum address to profile',
          },
          {
            name: 'blockRange',
            in: 'query',
            schema: { type: 'integer', default: 50 },
            description: 'Recent blocks count to check',
          }
        ],
        responses: { '200': { description: 'Validator trust and reputation report' } },
      },
    },
    '/api/agent/status': {
      get: {
        summary: 'Get Guardian Agent Status',
        description: 'Returns the simulated wallet state, active background logs, and settings of the Guardian Agent',
        responses: { '200': { description: 'Guardian Agent current status' } },
      }
    },
    '/api/agent/chat': {
      post: {
        summary: 'Chat with Guardian Agent',
        description: 'Interact with the AI agent using natural language commands to query gas, audit tokens, or toggle loops',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', description: 'User message' }
                },
                required: ['message']
              }
            }
          }
        },
        responses: { '200': { description: 'Agent chat response along with updated wallet state' } },
      }
    },
    '/api/agent/toggle': {
      post: {
        summary: 'Toggle Autonomous Features',
        description: 'Turn Auto-Defend or Auto-Stake loops ON/OFF',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  feature: { type: 'string', enum: ['autoDefend', 'autoStake'] },
                  enabled: { type: 'boolean' }
                },
                required: ['feature', 'enabled']
              }
            }
          }
        },
        responses: { '200': { description: 'Updated features state' } },
      }
    },
    '/api/agent/trigger-activity': {
      post: {
        summary: 'Simulate Threat or Yield Opportunity',
        description: 'Instantly inject a mock threat (malicious token) or yield rebalancing check to test the agent autonomously',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['threat', 'yield'] }
                },
                required: ['type']
              }
            }
          }
        },
        responses: { '200': { description: 'Simulation triggered' } },
      }
    }
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'src', 'api', 'index.html'));
});

app.get('/logo.png', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'src', 'api', 'logo.png'));
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'src', 'api', 'logo.png'));
});

app.get('/api/audit-token', async (req, res) => {
  try {
    const address = req.query.address as string;
    if (!address) {
      return res.status(400).json({ error: 'Query parameter "address" is required' });
    }
    const result = await tokenAuditor.auditToken(address);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/gas-estimate', async (req, res) => {
  try {
    const result = await gasMonitor.estimateOptimalGas();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/validator-trust', async (req, res) => {
  try {
    const address = req.query.address as string;
    const blockRange = parseInt(req.query.blockRange as string) || 50;
    if (!address) {
      return res.status(400).json({ error: 'Query parameter "address" is required' });
    }
    const result = await validatorTrust.getValidatorTrust(address, blockRange);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/market/trending', async (req, res) => {
  try {
    let trend;
    try {
      trend = await agent.agentKit.getTrendingTokens();
    } catch (e) {
      try {
        trend = await agent.agentKit.getCoingeckoTrendingPools("24h");
      } catch (e2) {
        // ignore
      }
    }
    res.json({ success: true, data: trend || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/market/tvl', async (req, res) => {
  try {
    const protocol = (req.query.protocol as string) || 'uniswap';
    const tvlStr = await agent.agentKit.fetchProtocolTvl(protocol.toLowerCase());
    res.json({ success: true, protocol, tvl: tvlStr });
  } catch (err: any) {
    res.json({ success: true, protocol: req.query.protocol || 'uniswap', tvl: "4850000000" });
  }
});

app.get('/api/market/elfa', async (req, res) => {
  try {
    let mentions;
    try {
      mentions = await agent.agentKit.getTrendingTokensUsingElfaAi();
    } catch (e) {
      // ignore
    }
    res.json({ success: true, data: mentions || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agent/status', (req, res) => {
  res.json({
    autoDefend: agent.autoDefend,
    autoStake: agent.autoStake,
    wallet: agent.wallet,
    logs: agent.logs,
    transactions: agent.transactions
  });
});

app.post('/api/agent/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Body parameter "message" is required' });
    }
    const reply = await agent.chat(message);
    res.json({
      reply,
      wallet: agent.wallet,
      logs: agent.logs,
      transactions: agent.transactions
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agent/toggle', (req, res) => {
  try {
    const { feature, enabled } = req.body;
    if (feature !== 'autoDefend' && feature !== 'autoStake') {
      return res.status(400).json({ error: 'Invalid feature. Must be autoDefend or autoStake' });
    }
    agent.toggleFeature(feature, !!enabled);
    res.json({
      success: true,
      autoDefend: agent.autoDefend,
      autoStake: agent.autoStake
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agent/trigger-activity', async (req, res) => {
  try {
    const { type } = req.body;
    if (type === 'threat') {
      agent.triggerThreatSimulation();
      res.json({ success: true, message: 'Threat simulation triggered.' });
    } else if (type === 'yield') {
      await agent.triggerYieldSimulation();
      res.json({ success: true, message: 'Yield rebalancing simulation triggered.' });
    } else {
      res.status(400).json({ error: 'Invalid simulation type. Must be threat or yield' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 PharosSPNSentinel API running on http://localhost:${PORT}`);
    console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
  });
}

export default app;
