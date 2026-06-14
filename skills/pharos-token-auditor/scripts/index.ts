import { TokenAuditor } from '../../../src/services/token-auditor';

export async function runTokenAuditor(address: string = '0xcfC8330f4BCAB529c625D12781b1C19466A9Fc8B') {
  console.log(`🛡️ Running Pharos Smart Contract Auditor on address: ${address}...`);
  const auditor = new TokenAuditor();
  try {
    const report = await auditor.auditToken(address);
    console.log('\n=======================================');
    console.log('🛡️ PHAROS CONTRACT AUDIT REPORT');
    console.log('=======================================');
    console.log(`Target Address:     ${report.address}`);
    console.log(`Is Smart Contract:  ${report.isContract}`);
    console.log(`Is Verified Code:   ${report.isVerified}`);
    console.log(`Has Mint Privileges: ${report.hasMintFunction}`);
    console.log(`Has Blacklist Logic: ${report.hasBlacklistFunction}`);
    console.log(`Is Upgradeable Proxy: ${report.isProxy}`);
    console.log('---------------------------------------');
    console.log(`Safety Score:       ${report.safetyScore}/100`);
    console.log(`Recommendation:     ${report.recommendation}`);
    console.log('---------------------------------------');
    console.log('Audit Details:');
    report.details.forEach(d => console.log(`  • ${d}`));
    console.log('=======================================\n');
    return report;
  } catch (error) {
    console.error('❌ Token audit failed:', error);
    throw error;
  }
}

if (require.main === module) {
  const targetAddress = process.argv[2] || '0xcfC8330f4BCAB529c625D12781b1C19466A9Fc8B';
  runTokenAuditor(targetAddress).catch(() => process.exit(1));
}
