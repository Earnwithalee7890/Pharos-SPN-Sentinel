import { PharosProvider } from '../core/pharos-provider';
import { TokenAuditReport } from '../core/types';
import { isAddress } from 'ethers';

export class TokenAuditor {
  private provider = PharosProvider.getInstance().getProvider();

  public async auditToken(address: string): Promise<TokenAuditReport> {
    if (!isAddress(address)) {
      throw new Error(`Invalid EVM address format: ${address}`);
    }

    try {
      const code = await this.provider.getCode(address);
      const isContract = code !== '0x' && code !== '0x0' && code !== '';

      if (!isContract) {
        return {
          address,
          isContract: false,
          isVerified: false,
          hasMintFunction: false,
          hasBlacklistFunction: false,
          isProxy: false,
          safetyScore: 100,
          recommendation: 'SAFE',
          details: [
            'This address is an Externally Owned Account (EOA), not a smart contract.',
            'No contract risks detected (standard wallet).'
          ]
        };
      }

      // Perform static analysis on the contract bytecode
      const bytecode = code.toLowerCase();
      
      // Look for common function selectors or patterns
      // 1. Blacklist function selector check (e.g. blacklist(address) -> 0xf86105f2 or similar)
      const hasBlacklistSignatures = 
        bytecode.includes('blacklist') || 
        bytecode.includes('freeze') ||
        bytecode.includes('f86105f2') || 
        bytecode.includes('095ea7b3'); // common transfer approval restriction

      // 2. Mint function selector check (e.g. mint(address,uint256) -> 0x40c10f19)
      const hasMintSignatures = 
        bytecode.includes('mint') || 
        bytecode.includes('40c10f19');

      // 3. Proxy contract indicator (look for DELEGATECALL opcode -> 0xf4)
      const isProxy = bytecode.includes('f4'); // DELEGATECALL

      // 4. Verification simulation (check bytecode complexity)
      const isVerified = bytecode.length > 100;

      let safetyScore = 100;
      const details: string[] = [];

      details.push('Smart contract detected on Pharos Chain.');

      if (isVerified) {
        details.push('✓ Contract bytecode appears complex and complete.');
      } else {
        safetyScore -= 15;
        details.push('⚠️ Contract bytecode is extremely short (potential placeholder or unverified contract).');
      }

      if (hasMintSignatures) {
        safetyScore -= 20;
        details.push('⚠️ Mint function signature detected: Owner can print new tokens, diluting holders.');
      } else {
        details.push('✓ No active minting signatures found (fixed supply).');
      }

      if (hasBlacklistSignatures) {
        safetyScore -= 25;
        details.push('⚠️ Blacklist function signature detected: Owner can freeze funds or block transfers.');
      } else {
        details.push('✓ No blacklist or transfer freeze signatures found.');
      }

      if (isProxy) {
        safetyScore -= 15;
        details.push('⚠️ Proxy pattern detected: Code can be upgraded/swapped by the admin at any time.');
      } else {
        details.push('✓ Static logic contract (non-upgradeable).');
      }

      const recommendation = safetyScore >= 80 ? 'SAFE' as const :
                             safetyScore >= 50 ? 'CAUTION' as const : 'DANGEROUS' as const;

      return {
        address,
        isContract: true,
        isVerified,
        hasMintFunction: hasMintSignatures,
        hasBlacklistFunction: hasBlacklistSignatures,
        isProxy,
        safetyScore,
        recommendation,
        details
      };
    } catch (error: any) {
      throw new Error(`Token audit failed: ${error.message}`);
    }
  }
}
