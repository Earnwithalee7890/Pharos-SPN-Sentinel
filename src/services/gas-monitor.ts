import { PharosProvider } from '../core/pharos-provider';
import { GasOptimization } from '../core/types';
import { formatUnits, parseUnits } from 'ethers';

export class GasMonitor {
  private provider = PharosProvider.getInstance().getProvider();

  public async estimateOptimalGas(): Promise<GasOptimization> {
    try {
      const feeData = await this.provider.getFeeData();
      const block = await this.provider.getBlock('latest');
      
      const currentBaseFee = block?.baseFeePerGas || 0n;
      const priorityFee = feeData.maxPriorityFeePerGas || parseUnits('1', 'gwei');
      
      // 20% buffer for Pharos gas refund mechanism
      const maxFeePerGas = ((currentBaseFee * 2n) + priorityFee) * 120n / 100n;
      
      const estimatedWaitTimeSeconds = 1;
      
      // Congestion analysis
      const gasUsed = Number(block?.gasUsed || 0n);
      const gasLimit = Number(block?.gasLimit || 1n);
      const utilization = gasUsed / gasLimit;
      
      const networkCongestion = utilization > 0.7 ? 'HIGH' as const :
                                 utilization > 0.3 ? 'MEDIUM' as const : 'LOW' as const;
      
      const optimalTimeWindow = networkCongestion === 'HIGH' ? 'IN_5_MIN' as const :
                                 networkCongestion === 'MEDIUM' ? 'NOW' as const : 'NOW' as const;

      return {
        currentBaseFee: formatUnits(currentBaseFee, 'gwei') + ' Gwei',
        priorityFee: formatUnits(priorityFee, 'gwei') + ' Gwei',
        maxFeePerGas: formatUnits(maxFeePerGas, 'gwei') + ' Gwei',
        estimatedWaitTimeSeconds,
        optimalTimeWindow,
        networkCongestion
      };
    } catch (error: any) {
      throw new Error(`Failed to estimate gas: ${error.message}`);
    }
  }
}
