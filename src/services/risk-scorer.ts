export function calculateRiskScore(params: {
  isVerified: boolean;
  hasMintFunction: boolean;
  hasBlacklistFunction: boolean;
  isProxy: boolean;
  liquidityDepth: string;
  holderCount: number;
}): { score: number; recommendation: 'BUY' | 'CAUTION' | 'AVOID'; reasons: string[] } {
  
  let score = 0;
  const reasons: string[] = [];

  if (!params.isVerified) {
    score += 50;
    reasons.push('Unverified contract source code (+50 risk).');
  }

  if (params.hasMintFunction) {
    score += 40;
    reasons.push('Contract has a mint function which can inflate supply infinitely (+40 risk).');
  }

  if (params.hasBlacklistFunction) {
    score += 30;
    reasons.push('Contract has a blacklist function which can freeze user funds (+30 risk).');
  }

  if (params.isProxy) {
    score += 20;
    reasons.push('Contract is an upgradable proxy; logic can change at any time (+20 risk).');
  }

  if (params.liquidityDepth === 'Low') {
    score += 25;
    reasons.push('Low liquidity depth; high slippage or potential rug pull (+25 risk).');
  }

  if (params.holderCount < 100) {
    score += 15;
    reasons.push('Very few token holders; highly centralized supply (+15 risk).');
  } else if (params.holderCount > 5000) {
    score -= 10;
    reasons.push('High holder count indicates broader distribution (-10 risk).');
  }

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  let recommendation: 'BUY' | 'CAUTION' | 'AVOID';
  
  if (score >= 70) {
    recommendation = 'AVOID';
  } else if (score >= 30) {
    recommendation = 'CAUTION';
  } else {
    recommendation = 'BUY';
  }

  return {
    score,
    recommendation,
    reasons
  };
}
