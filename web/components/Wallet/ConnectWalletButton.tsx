import { useWalletConnect, useWalletStore } from '@components/Wallet/hooks';
import { useEffect, useState } from 'react';
import { type Wallet } from '@ergo/wallet';
import { Button } from '@components/Common/Button';
import { backendRequest } from '@utils/utils';

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

  const createUserIfNotExists = async (address: string): Promise<void> => {
    const profileInfoResponse = await backendRequest(
      `/user?address=${address}`
    );
    if (profileInfoResponse.status !== 200) {
      if (profileInfoResponse.body === 'User not found') {
        const userCreateResponse = await backendRequest('/user', 'POST', {
          address,
        });
        if (userCreateResponse.status !== 200) {
          console.error(JSON.stringify(userCreateResponse));
        }
      } else {
        console.error(profileInfoResponse);
      }
    }
  };

  useEffect(() => {
    if (address !== undefined) {
      setDisplayAddress(shortenString(address, 11));
      createUserIfNotExists(address).catch(console.error);
    }
    setConnectedWallet(wallet);
  }, [address, wallet]);

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
