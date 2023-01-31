import { type WalletApi } from '../types';
import {
  type UnsignedTransaction,
  type SignedTransaction,
} from '@fleet-sdk/common/src/types';
import { config } from '@config';

interface WalletAuthApi {
  connect: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  isConnected: () => Promise<boolean>;
  getContext: () => Promise<WalletApi | undefined>;
}

export class Wallet {
  _walletApi?: WalletApi;

  async init(): Promise<void> {
    console.log('VVV'); // TODO remove
    console.log(config); // TODO remove
    if (this._walletApi !== undefined) {
      return;
    }

    const walletInjector =
      typeof window !== 'undefined'
        ? (window.ergoConnector?.nautilus as WalletAuthApi)
        : undefined;

    if (walletInjector === undefined) {
      throw new Error('WALLET_NOT_INSTALLED');
    }

    const walletApiInjected = await walletInjector.connect();
    if (!walletApiInjected) {
      throw new Error('Problem connecting to wallet');
    }
    this._walletApi = await walletInjector.getContext();
    if (this._walletApi == null) {
      throw new Error('Wallet API not available');
    }
  }

  async getCurrentHeight(): Promise<number> {
    await this.init();
    if (this._walletApi === undefined) {
      throw new Error('Wallet API not available');
    }
    return await this._walletApi.get_current_height();
  }

  async getAddress(): Promise<string> {
    await this.init();
    if (this._walletApi === undefined) {
      throw new Error('Wallet API not available');
    }
    const addressess = await this._walletApi.get_used_addresses();
    if (addressess.length === 0) {
      throw new Error('No used address available');
    }
    return addressess[0];
  }

  async signTx(unsignedTx: UnsignedTransaction): Promise<SignedTransaction> {
    await this.init();
    if (this._walletApi === undefined) {
      throw new Error('Wallet API not available');
    }
    return await this._walletApi.sign_tx(unsignedTx);
  }

  async submitTx(signedTx: SignedTransaction): Promise<string> {
    await this.init();
    if (this._walletApi === undefined) {
      throw new Error('Wallet API not available');
    }
    return await this._walletApi.submit_tx(signedTx);
  }
}
