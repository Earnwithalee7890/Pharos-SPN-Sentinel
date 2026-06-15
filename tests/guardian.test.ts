import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GuardianAgent } from '../src/services/guardian-agent';
import { PharosProvider } from '../src/core/pharos-provider';
import { parseUnits } from 'ethers';

// Mock PharosProvider
vi.mock('../src/core/pharos-provider', () => {
  const mockProvider = {
    getCode: vi.fn(),
    getBlock: vi.fn(),
    getFeeData: vi.fn(),
  };
  return {
    PharosProvider: {
      getInstance: () => ({
        getProvider: () => mockProvider,
        getWallet: () => undefined,
      }),
    },
  };
});

describe('Pharos Guardian Agent Service Tests', () => {
  const provider = PharosProvider.getInstance().getProvider() as any;
  let agent: GuardianAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BLOCKSCOUT_API_KEY = 'mock_api_key';
    agent = GuardianAgent.getInstance();
    // Stop loops to avoid background intervals running during tests
    agent.stopAutonomousLoop();
    // Reset agent balances for clean test runs
    agent.wallet.prosBalance = 1250.00;
    agent.wallet.usdcBalance = 250.00;
    agent.wallet.shieldBalance = 0.00;
    agent.wallet.stakedPros = 5000.00;
    agent.logs = [];
    agent.transactions = [];
  });

  it('should initialize with default states', () => {
    expect(agent.autoDefend).toBe(true);
    expect(agent.autoStake).toBe(true);
    expect(agent.wallet.prosBalance).toBe(1250.00);
    expect(agent.wallet.usdcBalance).toBe(250.00);
    expect(agent.wallet.stakedPros).toBe(5000.00);
  });

  it('should toggle agent features', () => {
    agent.toggleFeature('autoDefend', false);
    expect(agent.autoDefend).toBe(false);

    agent.toggleFeature('autoStake', false);
    expect(agent.autoStake).toBe(false);
  });

  it('should perform smart contract safety audits autonomously and swap malicious tokens (Auto-Defend)', async () => {
    // Mock getCode to return code with delegatecall (proxy) and mint/blacklist signature selectors
    provider.getCode.mockResolvedValue('0x6080604052348015610010575f80fd5b506004361061002b575f3560e01c806340c10f1914610030578063f86105f21461004a575b5f80fd5b34801561003c575f80fd5b506100486004356024356003055f600435602435600305f45b00');
    
    // Mock gas data
    provider.getBlock.mockResolvedValue({
      baseFeePerGas: parseUnits('10', 'gwei'),
      gasUsed: 1000000n,
      gasLimit: 10000000n,
    });
    provider.getFeeData.mockResolvedValue({
      maxPriorityFeePerGas: parseUnits('1.5', 'gwei'),
    });

    // Setup malicious token balance
    agent.wallet.shieldBalance = 500.00;

    // Trigger auto defend check
    await agent.runSecurityAuditAndDefend();

    // Verification
    expect(agent.wallet.shieldBalance).toBe(0.00);
    expect(agent.wallet.usdcBalance).toBe(500.00); // 250 starting + 250 from swap (500 * 0.5)
    expect(agent.transactions.length).toBe(1);
    expect(agent.transactions[0].type).toBe('SWAP');
    expect(agent.transactions[0].status).toBe('SUCCESS');
    expect(agent.logs.some(l => l.message.includes('Exited high-risk token position autonomously'))).toBe(true);
  });

  it('should autonomously delegate idle PROS tokens to high-trust validator (Auto-Stake)', async () => {
    // Mock validator trust check data (Nakamoto and decentralization)
    provider.getBlock.mockImplementation((tagOrNumber: string | number) => {
      if (tagOrNumber === 'latest') {
        return Promise.resolve({
          number: 100,
          miner: '0xMinerA',
        });
      }
      const num = typeof tagOrNumber === 'number' ? tagOrNumber : 100;
      let miner = '0xMinerA';
      if (num % 4 === 1) miner = '0xMinerB';
      if (num % 4 === 2) miner = '0xMinerC';
      if (num % 4 === 3) miner = '0xMinerD';
      return Promise.resolve({
        number: num,
        miner,
      });
    });

    // Mock Blockscout endpoints for validator
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('action=balance')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: '1', message: 'OK', result: '32000000000000000000' }), // 32 ETH
        });
      }
      if (url.includes('action=getminedblocks')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: '1', message: 'OK', result: [{ blockNumber: '100' }] }),
        });
      }
      if (url.includes('action=txlist')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: '1', message: 'OK', result: Array(15).fill({ hash: '0x1' }) }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: '1', message: 'OK', result: [] }),
      });
    });

    // Mock gas data
    provider.getFeeData.mockResolvedValue({
      maxPriorityFeePerGas: parseUnits('1.5', 'gwei'),
    });

    // Trigger yield optimizer rebalance
    await agent.runYieldOptimization();

    // Verification
    expect(agent.wallet.prosBalance).toBe(1000.00); // 1250 - 250 staked
    expect(agent.wallet.stakedPros).toBe(5250.00); // 5000 + 250 staked
    expect(agent.transactions.length).toBe(1);
    expect(agent.transactions[0].type).toBe('STAKE');
    expect(agent.transactions[0].status).toBe('SUCCESS');
    expect(agent.logs.some(l => l.message.includes('Autonomously delegated 250 PROS to validator'))).toBe(true);

    global.fetch = originalFetch;
  });

  it('should parse natural language queries in chat', async () => {
    // 1. Wallet status query
    let reply = await agent.chat('show my wallet status please');
    expect(reply).toContain('Active Wallet');
    expect(reply).toContain('1250.00 PROS');

    // 2. Gas fee query
    provider.getBlock.mockResolvedValue({
      baseFeePerGas: parseUnits('10', 'gwei'),
      gasUsed: 1000000n,
      gasLimit: 10000000n,
    });
    provider.getFeeData.mockResolvedValue({
      maxPriorityFeePerGas: parseUnits('1.5', 'gwei'),
    });

    reply = await agent.chat('what is the optimal gas fee?');
    expect(reply).toContain('Gas Optimizer Recommendation');
    expect(reply).toContain('10.0 Gwei');

    // 3. Toggle off Auto-Defend command
    reply = await agent.chat('disable auto-defend');
    expect(agent.autoDefend).toBe(false);
    expect(reply).toContain('DISABLED');
  });
});
