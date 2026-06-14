import { SwapRouter } from '../../../src/services/swap-router';

export async function runSwapExecutor(tokenIn: string, tokenOut: string, amount: string, dryRun: boolean) {
  console.log(`🔄 Running Pharos Swap Executor (Dry Run: ${dryRun})...`);
  
  const router = new SwapRouter();
  
  try {
    const details = await router.executeSwap(tokenIn, tokenOut, amount, dryRun);
    const report = router.formatSwapReport(details);
    
    console.log(report);
    
    return details;
  } catch (error) {
    console.error(`❌ Swap failed:`, error);
    throw error;
  }
}

// If run directly from CLI
if (require.main === module) {
  const tokenIn = process.argv[2];
  const tokenOut = process.argv[3];
  const amount = process.argv[4];
  const isLive = process.argv[5] === '--live';
  
  if (!tokenIn || !tokenOut || !amount) {
    console.error('Usage: npx ts-node skills/pharos-swap-executor/scripts/index.ts <tokenIn> <tokenOut> <amount> [--live]');
    process.exit(1);
  }
  
  runSwapExecutor(tokenIn, tokenOut, amount, !isLive).catch(() => process.exit(1));
}
