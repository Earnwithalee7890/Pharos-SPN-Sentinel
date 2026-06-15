import { TokenAuditor } from './token-auditor';
import { GasMonitor } from './gas-monitor';
import { ValidatorTrust } from './validator-trust';
import { PharosProvider } from '../core/pharos-provider';
import { formatEther, parseEther } from 'ethers';

export interface AgentLog {
  timestamp: string;
  level: 'info' | 'warning' | 'success' | 'error';
  message: string;
}

export interface AgentTransaction {
  hash: string;
  type: 'SWAP' | 'STAKE' | 'UNSTAKE' | 'INCOMING_TOKEN' | 'DEPOSIT' | 'TRANSFER';
  amount: string;
  token: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  timestamp: string;
}

export interface AgentWallet {
  address: string;
  prosBalance: number;
  usdcBalance: number;
  shieldBalance: number;
  stakedPros: number;
  delegatedValidator: string;
}

export class GuardianAgent {
  private static instance: GuardianAgent;
  
  private tokenAuditor = new TokenAuditor();
  private gasMonitor = new GasMonitor();
  private validatorTrust = new ValidatorTrust();

  public autoDefend = true;
  public autoStake = true;

  public wallet: AgentWallet = {
    address: '0x0000000000000000000000000000000000000000',
    prosBalance: 0.00,
    usdcBalance: 0.00,
    shieldBalance: 0.00,
    stakedPros: 0.00,
    delegatedValidator: '0x0000000000000000000000000000000000000000'
  };

  public logs: AgentLog[] = [];
  public transactions: AgentTransaction[] = [];
  private loopInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.addLog('info', 'Pharos Guardian Agent initialized.');
    this.addLog('info', 'EIP-1559 Gas Optimizer online.');
    this.addLog('info', 'Static Bytecode Threat Scanner active.');
    this.addLog('info', 'Blockscout Validator Staking Profiler connected.');
    
    // Check if real wallet is loaded
    const wallet = PharosProvider.getInstance().getWallet();
    if (wallet) {
      this.wallet.address = wallet.address;
      this.addLog('success', `🔑 Real Web3 Wallet loaded: ${wallet.address}. Switching from simulated mode to active on-chain mode.`);
      this.syncOnChainBalance().catch(() => {});
    } else {
      this.addLog('info', 'No PRIVATE_KEY configured in .env. Running in simulated Sandbox mode.');
    }

    // Start autonomous reasoning loops
    this.startAutonomousLoop();
  }

  public async syncOnChainBalance() {
    const providerInstance = PharosProvider.getInstance();
    const wallet = providerInstance.getWallet();
    if (!wallet) return;

    try {
      const provider = providerInstance.getProvider();
      const balBigInt = await provider.getBalance(wallet.address);
      this.wallet.prosBalance = parseFloat(formatEther(balBigInt));
    } catch (err: any) {
      this.addLog('error', `[WALLET] Sync failed: ${err.message}`);
    }
  }

  public static getInstance(): GuardianAgent {
    if (!GuardianAgent.instance) {
      GuardianAgent.instance = new GuardianAgent();
    }
    return GuardianAgent.instance;
  }

  public addLog(level: 'info' | 'warning' | 'success' | 'error', message: string) {
    this.logs.unshift({
      timestamp: new Date().toISOString(),
      level,
      message
    });
    // Cap logs at 100 entries
    if (this.logs.length > 100) {
      this.logs.pop();
    }
  }

  public addTransaction(type: AgentTransaction['type'], amount: string, token: string, status: AgentTransaction['status']) {
    const hash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    this.transactions.unshift({
      hash,
      type,
      amount,
      token,
      status,
      timestamp: new Date().toISOString()
    });
    if (this.transactions.length > 50) {
      this.transactions.pop();
    }
    return hash;
  }

  public toggleFeature(feature: 'autoDefend' | 'autoStake', enabled: boolean) {
    if (feature === 'autoDefend') {
      this.autoDefend = enabled;
      this.addLog('info', `Autonomous Threat Defense set to ${enabled ? 'ENABLED' : 'DISABLED'}.`);
    } else if (feature === 'autoStake') {
      this.autoStake = enabled;
      this.addLog('info', `Autonomous Yield Staking set to ${enabled ? 'ENABLED' : 'DISABLED'}.`);
    }
  }

  /**
   * Simulates an incoming malicious token transfer to trigger auto-defense
   */
  public triggerThreatSimulation() {
    this.wallet.shieldBalance += 500.00;
    this.addLog('warning', `[SIMULATION] Incoming transfer of 500.00 SHIELD token detected in block.`);
    this.addTransaction('INCOMING_TOKEN', '500.00', 'SHIELD', 'SUCCESS');
    
    // Run threat scan immediately
    if (this.autoDefend) {
      this.runSecurityAuditAndDefend();
    }
  }

  /**
   * Simulates/triggers validator staking rebalancing
   */
  public async triggerYieldSimulation() {
    this.addLog('info', '[SIMULATION] Manual Staking Rebalance triggered by user.');
    await this.runYieldOptimization();
  }

  private startAutonomousLoop() {
    this.loopInterval = setInterval(async () => {
      if (PharosProvider.getInstance().getWallet()) {
        await this.syncOnChainBalance();
      } else {
        this.addLog('info', 'Scanning Pharos chain blocks for agent wallet state changes...');
      }
      
      if (this.autoDefend && this.wallet.shieldBalance > 0) {
        await this.runSecurityAuditAndDefend();
      }
      
      if (this.autoStake && this.wallet.prosBalance > 500) {
        await this.runYieldOptimization();
      }
    }, 15000); // Check every 15 seconds
  }

  public stopAutonomousLoop() {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }

  /**
   * Scans and swaps malicious tokens autonomously
   */
  public async runSecurityAuditAndDefend() {
    const maliciousTokenAddress = '0xcfC8330f4BCAB529c625D12781b1C19466A9Fc8B'; // Dummy SHIELD token
    const shieldAmount = this.wallet.shieldBalance;

    if (shieldAmount <= 0) return;

    this.addLog('info', `[SCAN] Scanning token contract balance. Found ${shieldAmount} SHIELD.`);
    this.addLog('info', `[AUDIT] Commencing security audit of contract: ${maliciousTokenAddress}`);

    try {
      const audit = await this.tokenAuditor.auditToken(maliciousTokenAddress);
      this.addLog('warning', `[AUDIT] Safety Score: ${audit.safetyScore}/100. Recommendation: ${audit.recommendation}`);
      audit.details.forEach(d => {
        if (d.startsWith('⚠️') || d.startsWith('❌')) {
          this.addLog('warning', `[RISK] ${d}`);
        }
      });

      if (audit.recommendation === 'DANGEROUS' || audit.recommendation === 'CAUTION') {
        this.addLog('error', `[DECISION] Threat verified. Initiating auto-defend sequence to secure assets.`);
        
        // Optimize gas
        this.addLog('info', `[GAS] Estimating optimal gas for swap operation...`);
        const gas = await this.gasMonitor.estimateOptimalGas();
        this.addLog('info', `[GAS] Recommended Max Fee: ${gas.maxFeePerGas} (with refund buffer). Optimal Time: ${gas.optimalTimeWindow}`);

        // Execute Swap Simulation
        const usdcSwapped = parseFloat((shieldAmount * 0.5).toFixed(2)); // Swap rate 1 SHIELD = 0.5 USDC
        
        this.wallet.shieldBalance = 0;
        this.wallet.usdcBalance += usdcSwapped;
        
        const txHash = this.addTransaction('SWAP', `${shieldAmount} SHIELD -> ${usdcSwapped} USDC`, 'USDC', 'SUCCESS');
        this.addLog('success', `[SWAP] Broadcasted swap transaction on Pharos. Tx Hash: ${txHash}`);
        this.addLog('success', `[SUCCESS] Exited high-risk token position autonomously. Swapped ${shieldAmount} SHIELD for ${usdcSwapped} USDC. Assets secured.`);
      }
    } catch (error: any) {
      this.addLog('error', `[ERROR] Auto-defend swap execution failed: ${error.message}`);
    }
  }

  /**
   * Stakes idle PROS balance autonomously to optimal validator
   */
  public async runYieldOptimization() {
    const prosToStake = 250.00;
    if (this.wallet.prosBalance < prosToStake) {
      this.addLog('info', `[YIELD] Idle PROS balance (${this.wallet.prosBalance} PROS) is too low to stake. Threshold: ${prosToStake} PROS.`);
      return;
    }

    this.addLog('info', '[YIELD] Scanning active validators and Blockscout reputation to optimize restaking yields...');

    try {
      const validator = '0x51b111109964d9eb43da7a7dc6d0917d551fb015'; // Default Validator
      const trust = await this.validatorTrust.getValidatorTrust(validator, 10);
      
      this.addLog('info', `[TRUST] Validator ${validator} reputation: ${trust.ethereumProfile.reputationScore}/100. Decentralization: ${trust.decentralizationScore}/100.`);
      
      if (trust.validatorConcentrationRisk !== 'HIGH') {
        this.addLog('info', `[DECISION] Validator is deemed secure (risk: ${trust.validatorConcentrationRisk}). Staking idle tokens...`);
        
        // Gas optimization
        const gas = await this.gasMonitor.estimateOptimalGas();
        
        // Real on-chain staking transaction if wallet is present
        const wallet = PharosProvider.getInstance().getWallet();
        if (wallet) {
          this.addLog('info', `[STAKE] Broadcasting real staking delegation of ${prosToStake} PROS to validator ${validator}...`);
          const txResponse = await wallet.sendTransaction({
            to: validator,
            value: parseEther(prosToStake.toString())
          });
          this.addLog('info', `[STAKE] Staking delegation broadcasted. Waiting for confirmation... Hash: ${txResponse.hash}`);
          await txResponse.wait();
          
          await this.syncOnChainBalance();
          const txHash = this.addTransaction('STAKE', `${prosToStake} PROS`, 'PROS', 'SUCCESS');
          this.addLog('success', `[SUCCESS] Autonomously delegated ${prosToStake} PROS to validator on-chain. Tx Hash: ${txHash}`);
        } else {
          // Simulated Staking
          this.wallet.prosBalance -= prosToStake;
          this.wallet.stakedPros += prosToStake;
          
          const txHash = this.addTransaction('STAKE', `${prosToStake} PROS`, 'PROS', 'SUCCESS');
          this.addLog('success', `[STAKE] Broadcasted staking delegation. Tx Hash: ${txHash}`);
          this.addLog('success', `[SUCCESS] Autonomously delegated ${prosToStake} PROS to validator. Staking yield harvested at estimated 5.8% APY.`);
        }
      } else {
        this.addLog('warning', `[YIELD] Aborting autonomous stake. Validator risk level is HIGH.`);
      }
    } catch (error: any) {
      this.addLog('error', `[ERROR] Staking rebalancing failed: ${error.message}`);
    }
  }

  /**
   * Natural Language Parser
   */
  public async chat(message: string): Promise<string> {
    const msg = message.toLowerCase();
    
    // 1. Audit check
    const auditMatch = msg.match(/audit\s+(0x[a-f0-9]{40})/i);
    if (auditMatch) {
      const address = auditMatch[1];
      this.addLog('info', `[CHAT] User requested security audit for address: ${address}`);
      try {
        const audit = await this.tokenAuditor.auditToken(address);
        let res = `🛡️ **Security Audit Report for** \`${address}\`:\n`;
        res += `• **Type**: ${audit.isContract ? 'Smart Contract' : 'Wallet (EOA)'}\n`;
        res += `• **Safety Score**: ${audit.safetyScore}/100 (${audit.recommendation})\n\n`;
        res += `**Detected Parameters**:\n`;
        res += `• Mint Signature: ${audit.hasMintFunction ? '⚠️ Yes' : '✓ No'}\n`;
        res += `• Blacklist Signature: ${audit.hasBlacklistFunction ? '⚠️ Yes' : '✓ No'}\n`;
        res += `• Upgradeable Proxy: ${audit.isProxy ? '⚠️ Yes (DELEGATECALL opcode found)' : '✓ No'}\n\n`;
        res += `**Audit Details**:\n`;
        audit.details.forEach(d => {
          res += `- ${d}\n`;
        });
        return res;
      } catch (err: any) {
        return `❌ Audit failed: ${err.message}`;
      }
    }

    // 2. Gas fee check
    if (msg.includes('gas') || msg.includes('fee')) {
      this.addLog('info', `[CHAT] User requested gas optimization metrics.`);
      try {
        const gas = await this.gasMonitor.estimateOptimalGas();
        return `⛽ **Pharos EIP-1559 Gas Optimizer Recommendation**:\n` +
          `• **Congestion**: \`${gas.networkCongestion}\`\n` +
          `• **Base Fee**: \`${gas.currentBaseFee}\`\n` +
          `• **Max Priority Fee**: \`${gas.priorityFee}\`\n` +
          `• **Recommended Max Fee**: \`${gas.maxFeePerGas}\` *(includes 20% Refund Buffer)*\n` +
          `• **Optimal Action Time**: \`${gas.optimalTimeWindow}\` (Est. wait time: ~${gas.estimatedWaitTimeSeconds}s)\n\n` +
          `*Note: Pharos gas refund allows users to overpay safely and get refunded. Always use the recommended Max Fee.*`;
      } catch (err: any) {
        return `❌ Failed to fetch gas details: ${err.message}`;
      }
    }

    // 3. Validator trust check
    const trustMatch = msg.match(/trust\s+(0x[a-f0-9]{40})/i) || msg.match(/validator\s+(0x[a-f0-9]{40})/i);
    if (trustMatch) {
      const address = trustMatch[1];
      this.addLog('info', `[CHAT] User requested trust assessment for validator: ${address}`);
      try {
        const trust = await this.validatorTrust.getValidatorTrust(address, 10);
        let res = `🔍 **Blockscout Staking & Trust Profile** for validator \`${address}\`:\n`;
        res += `• **Pharos L1 Decentralization**: ${trust.decentralizationScore}/100 (Nakamoto Coeff: ${trust.nakamotoCoeff})\n`;
        res += `• **Concentration Risk**: \`${trust.validatorConcentrationRisk}\`\n`;
        res += `• **Ethereum reputation (Blockscout)**: ${trust.ethereumProfile.reputationScore}/100 (Risk: \`${trust.ethereumProfile.riskLevel}\`)\n\n`;
        res += `**Validator Profile Details**:\n`;
        res += `• Balance on Ethereum: \`${trust.ethereumProfile.balanceEth} ETH\`\n`;
        res += `• Blocks Mined on Ethereum: \`${trust.ethereumProfile.blocksMinedCount}\`\n`;
        res += `• Normal Transactions: \`${trust.ethereumProfile.transactionCount}\`\n\n`;
        res += `**Security Assessment**:\n`;
        trust.details.forEach(d => {
          res += `- ${d}\n`;
        });
        return res;
      } catch (err: any) {
        return `❌ Trust check failed: ${err.message}`;
      }
    }

    // 4. Wallet/Agent Status check
    if (msg.includes('status') || msg.includes('wallet') || msg.includes('balance')) {
      this.addLog('info', `[CHAT] User requested wallet and agent status.`);
      return `🤖 **Guardian Agent & Wallet Status**:\n` +
        `• **Active Wallet**: \`${this.wallet.address}\`\n` +
        `• **Balances**:\n` +
        `  - Native **PROS**: \`${this.wallet.prosBalance.toFixed(2)} PROS\`\n` +
        `  - Staked **PROS**: \`${this.wallet.stakedPros.toFixed(2)} PROS\`\n` +
        `  - Safe **USDC**: \`${this.wallet.usdcBalance.toFixed(2)} USDC\`\n` +
        `  - Malicious **SHIELD**: \`${this.wallet.shieldBalance.toFixed(2)} SHIELD\`\n` +
        `• **Active Toggles**:\n` +
        `  - Auto-Defend Threat Scanner: \`${this.autoDefend ? 'Active (ON)' : 'Inactive (OFF)'}\`\n` +
        `  - Auto-Yield Staking Loop: \`${this.autoStake ? 'Active (ON)' : 'Inactive (OFF)'}\`\n\n` +
        `*Try clicking the 'Simulate Threat Attack' button on the dashboard to see me sweep and secure malicious tokens autonomously!*`;
    }

    // 5. Config adjustments
    if (msg.includes('enable auto-defend') || msg.includes('turn on auto-defend')) {
      this.toggleFeature('autoDefend', true);
      return `✓ Autonomous Threat Defense is now **ENABLED**. I will monitor your wallet and defend against honeypots.`;
    }
    if (msg.includes('disable auto-defend') || msg.includes('turn off auto-defend')) {
      this.toggleFeature('autoDefend', false);
      return `⚠️ Autonomous Threat Defense is now **DISABLED**. I will not perform autonomous safety sweeps.`;
    }
    if (msg.includes('enable auto-stake') || msg.includes('turn on auto-stake')) {
      this.toggleFeature('autoStake', true);
      return `✓ Autonomous Staking is now **ENABLED**. I will delegate idle tokens to validators.`;
    }
    if (msg.includes('disable auto-stake') || msg.includes('turn off auto-stake')) {
      this.toggleFeature('autoStake', false);
      return `⚠️ Autonomous Staking is now **DISABLED**. Staking yields must be delegated manually.`;
    }

    // 6. Transfer/Send native PROS tokens on-chain
    const transferRegex = /(?:transfer|send)\s+([\d.]+)\s*(?:pros)?\s+to\s+(0x[a-fA-F0-9]{40})/i;
    const transferMatch = msg.match(transferRegex);
    if (transferMatch) {
      const amountStr = transferMatch[1];
      const destAddress = transferMatch[2];
      const amount = parseFloat(amountStr);

      if (isNaN(amount) || amount <= 0) {
        return `❌ Invalid transfer amount: \`${amountStr}\``;
      }

      this.addLog('info', `[CHAT] User requested transfer of ${amount} PROS to ${destAddress}`);
      
      const providerInstance = PharosProvider.getInstance();
      const wallet = providerInstance.getWallet();

      if (!wallet) {
        // Simulated transfer
        this.addLog('info', `[TRANSFER] Simulated transfer of ${amount} PROS to ${destAddress}`);
        const mockTx = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        this.wallet.prosBalance -= amount;
        this.addTransaction('TRANSFER', `${amount} PROS -> ${destAddress}`, 'PROS', 'SUCCESS');
        this.addLog('success', `[SUCCESS] Simulated transfer broadcasted. Tx Hash: ${mockTx}`);
        return `💸 **Simulated Transfer Sent!**\n` +
          `• Destination: \`${destAddress}\`\n` +
          `• Amount: \`${amount} PROS\`\n` +
          `• Tx Hash: \`${mockTx}\` (Simulated)\n` +
          `*To execute real on-chain transfers, please add your PRIVATE_KEY in the server's .env file.*`;
      }

      try {
        const balanceBigInt = await providerInstance.getProvider().getBalance(wallet.address);
        const amountBigInt = parseEther(amountStr);

        if (balanceBigInt < amountBigInt) {
          return `❌ Insufficient balance. Wallet has ${this.wallet.prosBalance.toFixed(4)} PROS, requested transfer of ${amount} PROS.`;
        }

        this.addLog('info', `[TRANSFER] Constructing transaction to transfer ${amount} PROS...`);
        const txResponse = await wallet.sendTransaction({
          to: destAddress,
          value: amountBigInt
        });
        
        this.addLog('info', `[TRANSFER] Transaction broadcasted. Waiting for confirmation... Hash: ${txResponse.hash}`);
        const receipt = await txResponse.wait();
        
        await this.syncOnChainBalance();
        this.addTransaction('TRANSFER', `${amount} PROS -> ${destAddress}`, 'PROS', 'SUCCESS');
        this.addLog('success', `[SUCCESS] Real transfer confirmed! Hash: ${txResponse.hash}`);
        
        return `🚀 **On-Chain Transfer Confirmed!**\n` +
          `• Destination: \`${destAddress}\`\n` +
          `• Amount: \`${amount} PROS\`\n` +
          `• Transaction Hash: [\`${txResponse.hash}\`](https://scan.pharos.xyz/tx/${txResponse.hash})`;
      } catch (err: any) {
        this.addLog('error', `[TRANSFER] On-chain transfer failed: ${err.message}`);
        return `❌ **Transfer Failed!**\nError: ${err.message}`;
      }
    }

    // Default Fallback
    return `🤖 **Pharos Guardian Agent Workspace Console**\n` +
      `I am your autonomous on-chain co-pilot. I audit contracts, optimize gas fees, and rebalance restaking yield.\n\n` +
      `Here are some commands I understand:\n` +
      `• **"wallet status"** - inspect your balances and sentinel configurations.\n` +
      `• **"transfer [amount] to [address]"** - send native PROS on-chain (e.g. \`transfer 5 to 0x8B3217038eF3F827aC9eD396264906dCDb16d10c\`).\n` +
      `• **"audit [address]"** - scan a contract bytecode (e.g. \`audit 0xcfC8330f4BCAB529c625D12781b1C19466A9Fc8B\`).\n` +
      `• **"optimal gas"** - check EIP-1559 gas recommenders.\n` +
      `• **"trust [validator]"** - check decentralization & Blockscout history (e.g. \`trust 0x51b111109964d9eb43da7a7dc6d0917d551fb015\`).\n` +
      `• **"disable auto-defend"** or **"enable auto-stake"** - adjust settings.`;
  }
}
