export interface TokenAuditReport {
  address: string;
  isContract: boolean;
  isVerified: boolean;
  hasMintFunction: boolean;
  hasBlacklistFunction: boolean;
  isProxy: boolean;
  safetyScore: number; // 0-100 (higher is safer)
  recommendation: 'SAFE' | 'CAUTION' | 'DANGEROUS';
  details: string[];
}

export interface GasOptimization {
  currentBaseFee: string;
  priorityFee: string;
  maxFeePerGas: string;
  estimatedWaitTimeSeconds: number;
  optimalTimeWindow: 'NOW' | 'IN_5_MIN' | 'LATER';
  networkCongestion: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ValidatorStakingProfile {
  address: string;
  balanceEth: string;
  transactionCount: number;
  blocksMinedCount: number;
  reputationScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  details: string[];
}

export interface EVMChainComparison {
  chainId: number;
  chainName: string;
  gasPriceGwei: string;
  congestion: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ValidatorTrustReport {
  validatorAddress: string;
  totalValidators: number;
  decentralizationScore: number; // 0-100
  nakamotoCoeff: number;
  validatorConcentrationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  ethereumProfile: ValidatorStakingProfile;
  comparisons: EVMChainComparison[];
  details: string[];
  timestamp: string;
}

export interface CrossChainIntel {
  validatorAddress: string;
  stakingProfile: ValidatorStakingProfile;
  comparisons: EVMChainComparison[];
  timestamp: string;
}
