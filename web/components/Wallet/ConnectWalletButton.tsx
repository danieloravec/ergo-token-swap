import { useWalletConnect, useWalletStore } from '@components/Wallet/hooks';
import { useEffect, useState } from 'react';
import { type Wallet } from '@ergo/wallet';
import { Button } from '@components/Button';

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
    if (address !== undefined) {
      setDisplayAddress(shortenString(address, 11));
    }
    setConnectedWallet(wallet);
  }, [address, wallet]);

  return connectedWallet === undefined ? (
    <div>
      <Button
        onClick={() => {
          console.log('here');
          void (async () => {
            await connect('nautilus'); // TODO take this from user input
          })();
        }}
      >
        Connect wallet
      </Button>
    </div>
  ) : (
    <div>
      <Button onClick={disconnect}>{displayAddress}</Button>
    </div>
  );
}
