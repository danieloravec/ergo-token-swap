import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useWalletConnect } from '@components/Wallet/hooks';
import React, { useEffect, useState } from 'react';
import { Chakra_Petch } from '@next/font/google';
import { ThemeProvider } from 'styled-components';
import { useThemeStore } from '@components/hooks';
import { config } from '@config';
import { themes } from '@themes/themes';
import Head from 'next/head';

const chakraPetch = Chakra_Petch({
  weight: '500',
  subsets: ['latin'],
});

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  const { reconnect } = useWalletConnect();
  const [selectedThemeName, setSelectedThemeName] = useState<'light' | 'dark'>(
    config.defaultThemeName
  );
  const { themeName } = useThemeStore();

  useEffect(() => {
    const load = async (): Promise<void> => {
      await reconnect();
    };
    void load();
  }, []);

  useEffect(() => {
    setSelectedThemeName(themeName);
  });

  return (
    <>
      <Head>
        <title>SingleTxSwap</title>
        <meta
          name="description"
          content="A trustless multisig escrow service for Ergo blockchain"
        />
      </Head>
      <main className={chakraPetch.className}>
        <ThemeProvider theme={themes[selectedThemeName]}>
          <Component {...pageProps} />
        </ThemeProvider>
      </main>
    </>
  );
}
