import { useWalletConnect, useWalletStore} from "@components/Wallet/hooks";
import {useEffect, useState} from "react";
import {Wallet} from "@ergo/wallet";

export function ConnectWalletButton() {
    const [displayAddress, setDisplayAddress] = useState<string | undefined>(undefined);
    const [connectedWallet, setConnectedWallet] = useState<Wallet | undefined>(undefined);
    const {wallet, address} = useWalletStore();
    const { connect, disconnect } = useWalletConnect();

    const shortenString = (str: string, maxLength: number) => {
        if(str.length <= maxLength) {
            return str;
        }
        const endLength = (maxLength - 3) / 2;
        return str.substring(0, endLength) + "..." + str.substring(str.length - endLength, str.length);
    }

    useEffect(() => {
        if(address !== undefined) {
            setDisplayAddress(shortenString(address, 11));
        }
        setConnectedWallet(wallet);
    }, [address, wallet]);

    return connectedWallet === undefined ? (
        <div>
            <button onClick={connect}>
                Connect wallet
            </button>
        </div>
        ) : (
        <div>
            <button onClick={disconnect}>
                {displayAddress}
            </button>
        </div>
    );
}