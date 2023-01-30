import '../styles/globals.css'
import type { AppProps } from 'next/app'
import {useWalletConnect} from "@components/Wallet/hooks";
import {useEffect} from "react";

export default function App({ Component, pageProps }: AppProps) {
  const {reconnect} = useWalletConnect();
  useEffect(() => {
    const load = async () => {
        await reconnect();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <Component {...pageProps} />
}
