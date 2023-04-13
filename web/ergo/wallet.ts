import { type WalletApi } from '../types';
import {
  type UnsignedTransaction,
  type SignedTransaction,
} from '@fleet-sdk/common/src/types';
import { type SignedInput } from '@fleet-sdk/common';

interface WalletAuthApi {
  connect: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  isConnected: () => Promise<boolean>;
  getContext: () => Promise<WalletApi | undefined>;
}

export type SupportedWalletName = 'nautilus' | 'safew';

export class Wallet {
  _walletApi?: WalletApi;
  _walletName?: SupportedWalletName;

  constructor(walletName: SupportedWalletName) {
    this._walletName = walletName;
  }

  async init(): Promise<void> {
    if (this._walletApi !== undefined) {
      return;
    }

    const walletInjector =
      typeof window !== 'undefined'
        ? this._walletName === 'nautilus'
          ? (window.ergoConnector?.nautilus as WalletAuthApi)
          : this._walletName === 'safew'
          ? (window.ergoConnector?.safew as WalletAuthApi)
          : undefined
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
      const unusedAddressess = await this._walletApi.get_unused_addresses();
      if (unusedAddressess.length === 0) {
        throw new Error('No address available');
      }
      return unusedAddressess[0];
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

  async signTxInputs(
    unsignedTx: UnsignedTransaction,
    indices: number[]
  ): Promise<SignedInput[]> {
    await this.init();
    if (this._walletApi === undefined) {
      throw new Error('Wallet API not available');
    }
    return await this._walletApi.sign_tx_inputs(unsignedTx, indices);
  }

  async signData(address: string, message: string): Promise<string> {
    // TODO remove this and use the commented part instead once dApp sign_data is implemented in dApp connector
    return 'INVALID_SIGNATURE_NOT_IMPLEMENTED';
    // await this.init();
    // if (this._walletApi === undefined) {
    //   throw new Error('Wallet API not available');
    // }
    // return await this._walletApi.sign_data(address, message);
  }

  async submitTx(signedTx: SignedTransaction): Promise<string> {
    await this.init();
    if (this._walletApi === undefined) {
      throw new Error('Wallet API not available');
    }
    return await this._walletApi.submit_tx(signedTx);
  }
}
