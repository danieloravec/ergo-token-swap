import { useWalletConnect, useWalletStore} from "@components/Wallet/hooks";
import {useEffect, useState} from "react";
import {Wallet} from "@ergo/wallet";

export function ConnectWalletButton() {
    // const { wallet, address } = useWalletStore();
    const [displayAddress, setDisplayAddress] = useState<string | undefined>(undefined);
    const [connectedWallet, setConnectedWallet] = useState<Wallet | undefined>(undefined);
    const {wallet, address} = useWalletStore();
    const { connect, disconnect } = useWalletConnect();

    useEffect(() => {
        setDisplayAddress(address);
        setConnectedWallet(wallet);
    });

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