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

    const pk = process.env.PRIVATE_KEY;
    if (pk && pk !== 'your_private_key_here' && pk.trim() !== '') {
      try {
        this.wallet = new Wallet(pk, this.provider);
      } catch (error) {
        console.warn('⚠️ Warning: Invalid PRIVATE_KEY provided. Running in read-only mode.');
      }
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
