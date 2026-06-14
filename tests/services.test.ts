import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenAuditor } from '../src/services/token-auditor';
import { GasMonitor } from '../src/services/gas-monitor';
import { ValidatorTrust } from '../src/services/validator-trust';
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
      }),
    },
  };
});

describe('Pharos Agent Shield Services Tests', () => {
  const provider = PharosProvider.getInstance().getProvider() as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TokenAuditor', () => {
    it('should identify Externally Owned Accounts (EOAs)', async () => {
      provider.getCode.mockResolvedValue('0x'); // No code = EOA

      const auditor = new TokenAuditor();
      const report = await auditor.auditToken('0x51b111109964d9eb43da7a7dc6d0917d551fb015');

      expect(report.isContract).toBe(false);
      expect(report.safetyScore).toBe(100);
      expect(report.recommendation).toBe('SAFE');
    });

    it('should audit smart contracts and identify vulnerabilities', async () => {
      // Mock code that contains delegatecall (proxy) and mint/blacklist signature selectors
      provider.getCode.mockResolvedValue('0x6080604052348015610010575f80fd5b506004361061002b575f3560e01c806340c10f1914610030578063f86105f21461004a575b5f80fd5b34801561003c575f80fd5b506100486004356024356003055f600435602435600305f45b00'); 
      
      const auditor = new TokenAuditor();
      const report = await auditor.auditToken('0xcfC8330f4BCAB529c625D12781b1C19466A9Fc8B');

      expect(report.isContract).toBe(true);
      expect(report.hasMintFunction).toBe(true); // bytecode includes '40c10f19'
      expect(report.hasBlacklistFunction).toBe(true); // bytecode includes 'f86105f2'
      expect(report.isProxy).toBe(true); // bytecode includes 'f4' (delegatecall)
      expect(report.safetyScore).toBeLessThan(80);
      expect(report.recommendation).toBe('DANGEROUS');
    });
  });

  describe('GasMonitor', () => {
    it('should estimate gas parameters with EIP-1559 and buffer', async () => {
      provider.getBlock.mockResolvedValue({
        baseFeePerGas: parseUnits('10', 'gwei'),
        gasUsed: 1000000n,
        gasLimit: 10000000n,
      });
      provider.getFeeData.mockResolvedValue({
        maxPriorityFeePerGas: parseUnits('1.5', 'gwei'),
      });

      const monitor = new GasMonitor();
      const result = await monitor.estimateOptimalGas();

      expect(result.currentBaseFee).toBe('10.0 Gwei');
      expect(result.priorityFee).toBe('1.5 Gwei');
      // maxFeePerGas = ((10 * 2) + 1.5) * 1.2 = 25.8 Gwei
      expect(result.maxFeePerGas).toBe('25.8 Gwei');
      expect(result.networkCongestion).toBe('LOW');
    });
  });

  describe('ValidatorTrust', () => {
    it('should calculate validator trust using L1 metrics and Blockscout API', async () => {
      const originalApiKey = process.env.BLOCKSCOUT_API_KEY;
      process.env.BLOCKSCOUT_API_KEY = 'mock_api_key';
      const originalFetch = global.fetch;

      // Mock Pharos L1 block fetch (10 blocks)
      provider.getBlock.mockImplementation((tagOrNumber: string | number) => {
        if (tagOrNumber === 'latest') {
          return Promise.resolve({
            number: 100,
            miner: '0xMinerA',
          });
        }
        const number = typeof tagOrNumber === 'number' ? tagOrNumber : 100;
        let miner = '0xMinerA';
        if (number % 3 === 0) miner = '0xMinerB';
        if (number % 5 === 0) miner = '0xMinerC';
        return Promise.resolve({
          number,
          miner,
        });
      });

      // Mock Blockscout PRO API endpoints
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

      const trustService = new ValidatorTrust();
      const report = await trustService.getValidatorTrust('0xStakingAddress', 10);

      expect(report.validatorAddress).toBe('0xStakingAddress');
      expect(report.totalValidators).toBeGreaterThan(0);
      expect(report.nakamotoCoeff).toBeGreaterThan(0);
      expect(report.ethereumProfile.balanceEth).toBe('32.0000');
      expect(report.ethereumProfile.reputationScore).toBe(65);
      expect(report.validatorConcentrationRisk).toBe('MEDIUM');

      global.fetch = originalFetch;
      process.env.BLOCKSCOUT_API_KEY = originalApiKey;
    });
  });
});
