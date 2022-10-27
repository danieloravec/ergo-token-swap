import { WalletApi } from "../types";

export class Wallet {

    _walletApi?: WalletApi;

    async init(): Promise<void> {
        const walletInjector =
          typeof window !== "undefined"
            ? window.ergoConnector?.nautilus
            : undefined;
    
        if (!walletInjector) {
          throw new Error("WALLET_NOT_INSTALLED");
        }
    
        const walletApiInjected = await walletInjector.connect();
        if(!walletApiInjected) {
            throw new Error("Problem connecting to wallet");
        }
        this._walletApi = window.ergo;
        if(!this._walletApi) {
            throw new Error("Wallet API not available");
        }
    }
}