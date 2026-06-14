import { TokenAnalyzer } from '../../../src/services/token-analyzer';

export async function runTokenGuardian(tokenAddress: string) {
  console.log(`🛡️ Running Pharos Token Guardian on ${tokenAddress}...`);
  
  const analyzer = new TokenAnalyzer();
  
  try {
    const analysis = await analyzer.analyzeToken(tokenAddress);
    
    console.log('\n=======================================');
    console.log('📊 PHAROS TOKEN RISK ANALYSIS REPORT');
    console.log('=======================================');
    console.log(`Address:        ${analysis.address}`);
    console.log(`Risk Score:     ${analysis.riskScore}/100`);
    console.log(`Recommendation: ${analysis.recommendation}`);
    console.log('---------------------------------------');
    console.log('Details:');
    analysis.details.forEach((d: string) => console.log(` - ${d}`));
    console.log('=======================================\n');
    
    return analysis;
  } catch (error) {
    console.error(`❌ Analysis failed:`, error);
    throw error;
  }
}

// If run directly from CLI
if (require.main === module) {
  const address = process.argv[2];
  if (!address) {
    console.error('Please provide a token address. Example: npx ts-node skills/pharos-token-guardian/scripts/index.ts 0x...');
    process.exit(1);
  }
  
  runTokenGuardian(address).catch(() => process.exit(1));
}
