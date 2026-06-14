export interface TokenRiskAnalysis {
  address: string;
  isVerified: boolean;
  hasMintFunction: boolean;
  hasBlacklistFunction: boolean;
  isProxy: boolean;
  liquidityDepth: string;
  holderCount: number;
  riskScore: number; // 0-100, where 0 is safest, 100 is most dangerous
  recommendation: 'BUY' | 'CAUTION' | 'AVOID';
  details: string[];
}

export interface GasOptimization {
  currentBaseFee: bigint;
  priorityFee: bigint;
  maxFeePerGas: bigint;
  estimatedWaitTimeSeconds: number;
  optimalTimeWindow: 'NOW' | 'IN_5_MIN' | 'LATER';
}

export interface SwapExecutionDetails {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  estimatedAmountOut: string;
  minimumAmountOut: string;
  priceImpact: number;
  route: string[];
  gasEstimate: bigint;
  status: 'SUCCESS' | 'DRY_RUN' | 'FAILED';
  txHash?: string;
}
