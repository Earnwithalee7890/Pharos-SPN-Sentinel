import { GasMonitor } from '../../../src/services/gas-monitor';

export async function runGasOptimizer() {
  console.log(`⛽ Running Pharos Gas Optimizer...`);
  
  const monitor = new GasMonitor();
  
  try {
    const gasOpt = await monitor.estimateOptimalGas();
    
    console.log('\n=======================================');
    console.log('⛽ PHAROS GAS OPTIMIZER REPORT');
    console.log('=======================================');
    console.log(`Current Base Fee:      ${gasOpt.currentBaseFee}`);
    console.log(`Recommended Max Fee:   ${gasOpt.maxFeePerGas} (Includes 20% Refund Buffer)`);
    console.log(`Estimated Wait Time:   ~${gasOpt.estimatedWaitTimeSeconds} second(s)`);
    console.log(`Optimal Action Time:   ${gasOpt.optimalTimeWindow}`);
    console.log(`Network Congestion:    ${gasOpt.networkCongestion}`);
    console.log('---------------------------------------');
    console.log('Note: Pharos uses a gas refund mechanism.');
    console.log('Always use the recommended Max Fee to prevent');
    console.log('unexpected out-of-gas errors.');
    console.log('=======================================\n');
    
    return gasOpt;
  } catch (error) {
    console.error(`❌ Gas estimation failed:`, error);
    throw error;
  }
}

// If run directly from CLI
if (require.main === module) {
  runGasOptimizer().catch(() => process.exit(1));
}
