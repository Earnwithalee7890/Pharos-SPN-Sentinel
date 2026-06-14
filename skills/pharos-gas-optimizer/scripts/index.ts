import { GasMonitor } from '../../../src/services/gas-monitor';

export async function runGasOptimizer() {
  console.log(`⛽ Running Pharos Gas Optimizer...`);
  
  const monitor = new GasMonitor();
  
  try {
    const gasOpt = await monitor.estimateOptimalGas();
    const report = await monitor.formatGasReport(gasOpt);
    
    console.log(report);
    
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
