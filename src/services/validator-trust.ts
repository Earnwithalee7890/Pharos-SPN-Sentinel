import { PharosProvider } from '../core/pharos-provider';
import { ValidatorTrustReport } from '../core/types';
import { BlockscoutScout } from './blockscout-scout';

export class ValidatorTrust {
  private provider = PharosProvider.getInstance().getProvider();
  private blockscout = new BlockscoutScout();

  public async getValidatorTrust(validatorAddress: string, blockRange: number = 50): Promise<ValidatorTrustReport> {
    try {
      // 1. Fetch Pharos L1 Validator Info (Nakamoto and decentralization)
      const latestBlock = await this.provider.getBlock('latest');
      const startBlock = latestBlock!.number - blockRange;
      
      const blockPromises = [];
      for (let i = startBlock; i <= latestBlock!.number; i++) {
        blockPromises.push(this.provider.getBlock(i));
      }
      const blocks = await Promise.all(blockPromises);
      
      // Count blocks per miner
      const minerCounts: Record<string, number> = {};
      blocks.forEach(b => {
        if (b && b.miner) {
          minerCounts[b.miner] = (minerCounts[b.miner] || 0) + 1;
        }
      });
      
      const totalValidators = Object.keys(minerCounts).length;
      const totalBlocks = blocks.length;
      const sortedCounts = Object.values(minerCounts).sort((a, b) => b - a);
      
      let cumulative = 0;
      let nakamotoCoeff = 0;
      for (const count of sortedCounts) {
        cumulative += count;
        nakamotoCoeff++;
        if (cumulative > totalBlocks / 2) break;
      }
      
      // Handle fallback if totalValidators is 0
      const decentralizationScore = totalValidators > 0
        ? Math.min(100, Math.round((nakamotoCoeff / totalValidators) * 100 + nakamotoCoeff * 5))
        : 0;

      const concentrationRisk = nakamotoCoeff <= 1 ? 'HIGH' as const :
                                 nakamotoCoeff <= 3 ? 'MEDIUM' as const : 'LOW' as const;

      // 2. Fetch Cross-chain profile from Blockscout
      const crossChainIntel = await this.blockscout.getCrossChainIntel(validatorAddress);

      // Determine overall risk combining Pharos and Ethereum metrics
      const reputation = crossChainIntel.stakingProfile.reputationScore;
      const riskLevel = concentrationRisk === 'HIGH' || reputation < 40 ? 'HIGH' as const :
                        concentrationRisk === 'MEDIUM' || reputation < 70 ? 'MEDIUM' as const : 'LOW' as const;

      const details: string[] = [
        `Pharos L1 Decentralization: ${decentralizationScore}/100`,
        `Nakamoto Coefficient: ${nakamotoCoeff} (validators controls 51% of blocks)`,
        `Ethereum operator reputation score: ${reputation}/100`,
        riskLevel === 'LOW' 
          ? 'Highly reliable validator set and operator reputation. Safe for delegation.'
          : 'Elevated validator concentration or unproven operator history. Proceed with caution.'
      ];

      return {
        validatorAddress,
        totalValidators,
        decentralizationScore,
        nakamotoCoeff,
        validatorConcentrationRisk: concentrationRisk,
        ethereumProfile: crossChainIntel.stakingProfile,
        comparisons: crossChainIntel.comparisons,
        details,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      throw new Error(`Validator trust evaluation failed: ${error.message}`);
    }
  }
}
