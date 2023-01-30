import { WalletApi } from "../types";
import { UnsignedTransaction, SignedTransaction } from "@fleet-sdk/core/build/lib/module/types";

export class Wallet {

    _walletApi?: WalletApi;

    async init(): Promise<void> {
        if(this._walletApi !== undefined) {
            return;
        }

        const walletInjector =
          typeof window !== "undefined"
            ? window.ergoConnector?.nautilus
            : undefined;
    
        if (!walletInjector) {
          throw new Error("WALLET_NOT_INSTALLED");
        }

        const walletApiInjected = await walletInjector.connect();
        if (!walletApiInjected) {
            throw new Error("Problem connecting to wallet");
        }
        this._walletApi = await walletInjector.getContext();
        if (!this._walletApi) {
            throw new Error("Wallet API not available");
        }
    }

    async getCurrentHeight(): Promise<number> {
        await this.init();
        if(!this._walletApi) {
            throw new Error("Wallet API not available");
        }
        const currentHeight = await this._walletApi.get_current_height();
        return currentHeight;
    }

    async getAddress(): Promise<string> {
        await this.init();
        if(!this._walletApi) {
            throw new Error("Wallet API not available");
        }
        const addressess = await this._walletApi.get_used_addresses();
        if(addressess.length == 0) {
            throw new Error("No used address available");
        }
        return addressess[0];
    }

    async signTx(unsignedTx: UnsignedTransaction): Promise<SignedTransaction> {
        await this.init();
        if(!this._walletApi) {
            throw new Error("Wallet API not available");
        }
        const signedTx = await this._walletApi.sign_tx(unsignedTx);
        return signedTx;
    }

    async submitTx(signedTx: SignedTransaction): Promise<string> {
        await this.init();
        if(!this._walletApi) {
            throw new Error("Wallet API not available");
        }
        const txId = await this._walletApi.submit_tx(signedTx);
        return txId;
    }
}