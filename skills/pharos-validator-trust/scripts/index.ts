import { ValidatorTrust } from '../../../src/services/validator-trust';

export async function runValidatorTrust(address: string = '0x51b111109964d9eb43da7a7dc6d0917d551fb015') {
  console.log(`🔍 Running Validator Trust Assessor on address: ${address}...`);
  const trustService = new ValidatorTrust();
  
  try {
    const report = await trustService.getValidatorTrust(address, 50);
    
    console.log('\n=======================================');
    console.log('🔍 VALIDATOR TRUST & REPUTATION REPORT');
    console.log('=======================================');
    console.log(`Validator Address:      ${report.validatorAddress}`);
    console.log(`Total L1 Nodes Active:  ${report.totalValidators}`);
    console.log(`L1 Decentralization:    ${report.decentralizationScore}/100`);
    console.log(`Nakamoto Coefficient:   ${report.nakamotoCoeff}`);
    console.log(`L1 Concentration Risk:  ${report.validatorConcentrationRisk}`);
    console.log('---------------------------------------');
    console.log('ETHEREUM STAKING PROFILE (BLOCKSCOUT):');
    console.log(`  • Balance:            ${report.ethereumProfile.balanceEth} ETH`);
    console.log(`  • Normal TXs:         ${report.ethereumProfile.transactionCount}`);
    console.log(`  • Blocks Mined:       ${report.ethereumProfile.blocksMinedCount}`);
    console.log(`  • Reputation Score:   ${report.ethereumProfile.reputationScore}/100`);
    console.log(`  • Operator Risk Level: ${report.ethereumProfile.riskLevel}`);
    console.log('---------------------------------------');
    console.log('EVM Gas & Congestion Comparison:');
    report.comparisons.forEach(c => {
      console.log(`  • [${c.chainName}]: Gas ${c.gasPriceGwei} | Congestion: ${c.congestion}`);
    });
    console.log('---------------------------------------');
    console.log('Reputation Details:');
    report.details.forEach(d => console.log(`  • ${d}`));
    console.log('=======================================\n');
    
    return report;
  } catch (error) {
    console.error('❌ Validator trust check failed:', error);
    throw error;
  }
}

if (require.main === module) {
  const targetAddress = process.argv[2] || '0x51b111109964d9eb43da7a7dc6d0917d551fb015';
  runValidatorTrust(targetAddress).catch(() => process.exit(1));
}
