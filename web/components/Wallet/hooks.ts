import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type SupportedWalletName, Wallet } from '@ergo/wallet';

export const useWalletStore = create<{
  walletName?: SupportedWalletName;
  wallet?: Wallet;
  address?: string;
  setWalletName: (wn?: SupportedWalletName) => void;
  setWallet: (w?: Wallet) => void;
  setAddress: (addr?: string) => void;
}>()(
  persist(
    (set, get) => ({
      walletName: undefined,
      wallet: undefined,
      address: undefined,
      setWalletName: (wn?: SupportedWalletName) => {
        set({ walletName: wn });
      },
      setWallet: (w?: Wallet) => {
        set({ wallet: w });
      },
      setAddress: (addr?: string) => {
        set({ address: addr });
      },
    }),
    {
      name: 'wallet-storage',
    }
  )
);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useWalletConnect = () => {
  const { walletName, setWalletName, setWallet, setAddress } = useWalletStore();

  const connect = async (walletName: SupportedWalletName): Promise<void> => {
    try {
      const newWallet = new Wallet(walletName);
      await newWallet.init();
      const address = await newWallet.getAddress();
      setWalletName(walletName);
      setWallet(newWallet);
      setAddress(address);
    } catch (err) {
      console.log(err);
      disconnect();
    }
  };

  const disconnect = (): void => {
    setWalletName(undefined);
    setWallet(undefined);
    setAddress(undefined);
  };

  const reconnect = async (): Promise<void> => {
    disconnect();
    await connect(walletName ?? 'nautilus');
  };

  return { connect, disconnect, reconnect };
};
