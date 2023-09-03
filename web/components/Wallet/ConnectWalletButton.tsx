import { useWalletConnect, useWalletStore } from '@components/Wallet/hooks';
import { useEffect, useState } from 'react';
import { type Wallet } from '@ergo/wallet';
import { Button } from '@components/Common/Button';
import { createUserIfNotExists } from '@utils/utils';

export function ConnectWalletButton(): JSX.Element {
  const [displayAddress, setDisplayAddress] = useState<string | undefined>(
    undefined
  );
  const [connectedWallet, setConnectedWallet] = useState<Wallet | undefined>(
    undefined
  );
  const { wallet, address } = useWalletStore();
  const { connect, disconnect } = useWalletConnect();

  const shortenString = (str: string, maxLength: number): string => {
    if (str.length <= maxLength) {
      return str;
    }
    const endLength = (maxLength - 3) / 2;
    return (
      str.substring(0, endLength) +
      '...' +
      str.substring(str.length - endLength, str.length)
    );
  };

  useEffect(() => {
    setConnectedWallet(wallet);
  }, [wallet]);

  useEffect(() => {
    if (address === undefined) {
      return;
    }

    const handleAddrChange = async (): Promise<void> => {
      setDisplayAddress(shortenString(address, 11));
      await createUserIfNotExists(address);
    };

    handleAddrChange().catch(console.error);
  }, [address]);

  return connectedWallet === undefined ? (
    <Button
      onClick={() => {
        void (async () => {
          await connect('nautilus'); // TODO take this from user input
        })();
      }}
    >
      Connect wallet
    </Button>
  ) : (
    <Button onClick={disconnect}>{displayAddress}</Button>
  );
}
