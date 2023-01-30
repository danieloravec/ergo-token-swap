import { useWalletConnect, useWalletStore} from "@components/Wallet/hooks";

export function ConnectWalletButton() {
    const { wallet, address } = useWalletStore();
    const { connect, disconnect } = useWalletConnect();

    return wallet === undefined ? (
        <div>
            <button onClick={connect}>
                Connect wallet
            </button>
        </div>
        ) : (
        <div>
            <button onClick={disconnect}>
                {address}
            </button>
        </div>
    );
}