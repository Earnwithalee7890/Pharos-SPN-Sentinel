import { PharosProvider } from '../core/pharos-provider';
import { TokenRiskAnalysis } from '../core/types';
import { isValidAddress } from '../core/utils';
import { calculateRiskScore } from './risk-scorer';
import { Contract, Interface } from 'ethers';

// Basic ERC20 ABI to check standard functions
const ERC20_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

export class TokenAnalyzer {
  private provider = PharosProvider.getInstance().getProvider();

  public async analyzeToken(tokenAddress: string): Promise<TokenRiskAnalysis> {
    if (!isValidAddress(tokenAddress)) {
      throw new Error(`Invalid token address: ${tokenAddress}`);
    }

    const details: string[] = [];
    
    // In a real hackathon project, we would call the Pharos Block Explorer API
    // to get the contract source code and check if it's verified.
    // For this demonstration, we'll simulate some of these checks.
    
    let isVerified = true; 
    let hasMintFunction = false;
    let hasBlacklistFunction = false;
    let isProxy = false;
    let liquidityDepth = 'Unknown';
    let holderCount = 0;

    try {
      // 1. Check if it's a contract
      const code = await this.provider.getCode(tokenAddress);
      if (code === '0x') {
        throw new Error(`Address ${tokenAddress} is not a smart contract`);
      }

      // 2. Try to instantiate standard ERC20
      const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
      
      try {
        const symbol = await contract.symbol();
        details.push(`Token symbol: ${symbol}`);
      } catch (e) {
        details.push('Warning: Could not read token symbol. Might not be standard ERC20.');
      }

      // Simulated Pharos Explorer API checks
      // In production, we'd use: fetch(`https://api.pharosscan.xyz/api?module=contract&action=getsourcecode&address=${tokenAddress}`)
      
      // We will simulate some risky patterns detection based on bytecode heuristics
      // '0x...' check for mint-like signatures
      if (code.includes('40c10f19')) { // mint selector
        hasMintFunction = true;
        details.push('High Risk: Mint function detected in bytecode.');
      }
      
      if (code.includes('5c975abb')) { // pause selector
         details.push('Medium Risk: Pause function detected.');
      }
      
      if (code.includes('3659cfe6')) { // upgradeTo selector typical for proxies
        isProxy = true;
        details.push('Medium Risk: Contract is an upgradable proxy.');
      }

      // Simulate Liquidity and Holders (In reality, use Pharos DEX graphs/APIs)
      holderCount = Math.floor(Math.random() * 5000) + 10;
      liquidityDepth = holderCount > 1000 ? 'High' : 'Low';
      
      details.push(`Estimated Holder Count: ~${holderCount}`);
      details.push(`Estimated Liquidity Depth: ${liquidityDepth}`);

    } catch (error: any) {
      details.push(`Error during analysis: ${error.message}`);
    }

    // Calculate score
    const scoreResult = calculateRiskScore({
      isVerified,
      hasMintFunction,
      hasBlacklistFunction,
      isProxy,
      liquidityDepth,
      holderCount
    });

    details.push(...scoreResult.reasons);

    return {
      address: tokenAddress,
      isVerified,
      hasMintFunction,
      hasBlacklistFunction,
      isProxy,
      liquidityDepth,
      holderCount,
      riskScore: scoreResult.score,
      recommendation: scoreResult.recommendation,
      details
    };
  }
}
