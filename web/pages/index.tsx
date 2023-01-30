import dynamic from "next/dynamic";
import { ConnectWalletButton } from "@components/Wallet/ConnectWalletButton";

export default function Home() {
    return (
        <div>
            <ConnectWalletButton />
        </div>
    )
}
