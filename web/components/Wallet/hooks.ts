import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {Wallet} from "@ergo/wallet";

export const useWalletStore = create<{wallet?: Wallet, address?: string, setWallet: (w?: Wallet) => void, setAddress: (addr?: string) => void}>()(
    persist(
        (set, get) => ({
            wallet: undefined,
            address: undefined,
            setWallet: (w?: Wallet) => set({wallet: w}),
            setAddress: (addr?: string) => set({address: addr})
        }),
        {
            name: 'wallet-storage',
        }
    )
);

export const useWalletConnect = () => {
    const {setWallet, setAddress} = useWalletStore();

    const connect = async () => {
        const newWallet = new Wallet();
        await newWallet.init();
        const address = await newWallet.getAddress();
        setWallet(newWallet);
        setAddress(address);
    };

    const disconnect = () => {
        setWallet(undefined);
    }

    return {connect, disconnect};
}