import { PharosProvider } from '../core/pharos-provider';
import { GasOptimization } from '../core/types';
import { formatUnits } from 'ethers';

export class GasMonitor {
  private provider = PharosProvider.getInstance().getProvider();

  public async estimateOptimalGas(): Promise<GasOptimization> {
    try {
      const feeData = await this.provider.getFeeData();
      const block = await this.provider.getBlock('latest');
      
      // EIP-1559 base fee
      const currentBaseFee = block?.baseFeePerGas || 0n;
      // Default priority fee (Pharos handles this dynamically)
      const priorityFee = feeData.maxPriorityFeePerGas || parseUnits('1', 'gwei'); 
      
      // As per Pharos gas refund docs, always add a buffer to the expected max fee
      // so out-of-gas due to intermediate refund limits doesn't occur.
      const bufferMultiplier = 120n; // 20% buffer
      
      const maxFeePerGas = ((currentBaseFee * 2n) + priorityFee) * bufferMultiplier / 100n;

      // Pharos has sub-second finality
      const estimatedWaitTimeSeconds = 1; 
      
      // Analyze if it's a good time to transact based on arbitrary historical heuristic
      // In a real implementation, we'd query historical blocks
      const isCongested = currentBaseFee > parseUnits('50', 'gwei');
      
      let optimalTimeWindow: 'NOW' | 'IN_5_MIN' | 'LATER' = 'NOW';
      
      if (isCongested) {
        optimalTimeWindow = 'IN_5_MIN';
      }

      return {
        currentBaseFee,
        priorityFee,
        maxFeePerGas,
        estimatedWaitTimeSeconds,
        optimalTimeWindow
      };
    } catch (error: any) {
      throw new Error(`Failed to estimate gas: ${error.message}`);
    }
  }

  public async formatGasReport(gasOpt: GasOptimization): Promise<string> {
    const baseFeeGwei = formatUnits(gasOpt.currentBaseFee, 'gwei');
    const maxFeeGwei = formatUnits(gasOpt.maxFeePerGas, 'gwei');
    
    return `
=======================================
⛽ PHAROS GAS OPTIMIZER REPORT
=======================================
Current Base Fee:      ${baseFeeGwei} Gwei
Recommended Max Fee:   ${maxFeeGwei} Gwei (Includes 20% Refund Buffer)
Estimated Wait Time:   ~${gasOpt.estimatedWaitTimeSeconds} second(s)
Optimal Action Time:   ${gasOpt.optimalTimeWindow}
---------------------------------------
Note: Pharos utilizes a gas refund mechanism. 
Always use the recommended Max Fee to prevent 
unexpected out-of-gas errors.
=======================================`;
  }
}

// Internal helper if formatUnits isn't imported correctly from ethers
function parseUnits(value: string, unit: 'gwei' | 'wei' = 'wei'): bigint {
  if (unit === 'gwei') {
    return BigInt(value) * 10n ** 9n;
  }
  return BigInt(value);
}
