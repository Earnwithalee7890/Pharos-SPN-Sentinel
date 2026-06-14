import { JsonRpcProvider, Wallet } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

export class PharosProvider {
  private static instance: PharosProvider;
  public provider: JsonRpcProvider;
  public wallet?: Wallet;

  private constructor() {
    const rpcUrl = process.env.PHAROS_RPC_URL || 'https://rpc.pharos.xyz';
    // Use testnet ID or mainnet. Defaulting to Mainnet: 1672
    this.provider = new JsonRpcProvider(rpcUrl, {
      name: 'Pharos',
      chainId: 1672 
    });

    if (process.env.PRIVATE_KEY) {
      this.wallet = new Wallet(process.env.PRIVATE_KEY, this.provider);
    }
  }

  public static getInstance(): PharosProvider {
    if (!PharosProvider.instance) {
      PharosProvider.instance = new PharosProvider();
    }
    return PharosProvider.instance;
  }

  public getProvider(): JsonRpcProvider {
    return this.provider;
  }

  public getWallet(): Wallet | undefined {
    return this.wallet;
  }
}
