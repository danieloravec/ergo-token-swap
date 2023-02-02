import { useWalletConnect, useWalletStore } from '@components/Wallet/hooks';
import { useEffect, useState } from 'react';
import { type Wallet } from '@ergo/wallet';
import { buildTxWasmExample } from '@ergo/transactions';

export function ConnectWalletButton(): JSX.Element {
  const [displayAddress, setDisplayAddress] = useState<string | undefined>(
    undefined
  );
  const [connectedWallet, setConnectedWallet] = useState<Wallet | undefined>(
    undefined
  );
  const { wallet, address } = useWalletStore();
  const { connect } = useWalletConnect();

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
      <button
        onClick={() => {
          void (async () => {
            await connect('nautilus'); // TODO take this from user input
          })();
        }}
      >
        Connect wallet
      </button>
    </div>
  ) : (
    <div>
      <button
        onClick={() => {
          void (async () => {
            await buildTxWasmExample(wallet as Wallet);
          })();
        }}
      >
        {displayAddress}
      </button>
    </div>
  );
}
