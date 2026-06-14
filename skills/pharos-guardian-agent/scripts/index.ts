import { GuardianAgent } from '../../../src/services/guardian-agent';
import * as readline from 'readline';

export async function runGuardianAgent() {
  console.log('🤖 Starting Pharos Guardian Agent CLI REPL...');
  const agent = GuardianAgent.getInstance();
  
  // Print initial state
  console.log('\n=======================================');
  console.log('🛡️ PHAROS GUARDIAN SENTINEL ACTIVE');
  console.log('=======================================');
  console.log(`Wallet Address:  ${agent.wallet.address}`);
  console.log(`PROS Balance:    ${agent.wallet.prosBalance} PROS`);
  console.log(`USDC Balance:    ${agent.wallet.usdcBalance} USDC`);
  console.log(`Staked Balance:  ${agent.wallet.stakedPros} PROS`);
  console.log(`Auto-Defend:     ${agent.autoDefend ? 'ON' : 'OFF'}`);
  console.log(`Auto-Stake:      ${agent.autoStake ? 'ON' : 'OFF'}`);
  console.log('=======================================\n');
  console.log('Type a message to chat with the agent (e.g., "wallet status", "gas", "audit [address]").');
  console.log('Type "simulate threat" to trigger an autonomous threat swap simulation.');
  console.log('Type "exit" to quit.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const prompt = () => {
    rl.question('👤 You: ', async (input) => {
      const trimmed = input.trim();
      if (trimmed.toLowerCase() === 'exit') {
        agent.stopAutonomousLoop();
        rl.close();
        console.log('🤖 Goodbye!');
        return;
      }
      
      if (trimmed.toLowerCase() === 'simulate threat') {
        agent.triggerThreatSimulation();
        console.log('\n⚙️ Simulated threat injected. Background logs output:\n');
        
        // Print the most recent 6 logs in chronological order
        const recentLogs = [...agent.logs].slice(0, 8).reverse();
        recentLogs.forEach(log => {
          const prefix = log.level === 'success' ? '✓' : 
                         log.level === 'warning' ? '⚠️' : 
                         log.level === 'error' ? '❌' : '•';
          console.log(`  ${prefix} [${log.level.toUpperCase()}] ${log.message}`);
        });
        console.log('');
        prompt();
        return;
      }

      try {
        const reply = await agent.chat(trimmed);
        console.log(`\n🤖 Agent:\n${reply}\n`);
      } catch (err: any) {
        console.log(`\n❌ Error: ${err.message}\n`);
      }
      prompt();
    });
  };

  prompt();
}

if (require.main === module) {
  runGuardianAgent().catch(() => process.exit(1));
}
export { readline };
