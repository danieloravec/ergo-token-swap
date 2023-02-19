import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useWalletConnect } from '@components/Wallet/hooks';
import { useEffect } from 'react';
import { Chakra_Petch } from '@next/font/google';

const chakraPetch = Chakra_Petch({
  weight: '500',
  subsets: ['latin'],
});

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  const { reconnect } = useWalletConnect();
  useEffect(() => {
    const load = async (): Promise<void> => {
      await reconnect();
    };
    void load();
  }, []);
  return (
    <main className={chakraPetch.className}>
      <Component {...pageProps} />
    </main>
  );
}
