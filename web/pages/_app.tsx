import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useWalletConnect } from '@components/Wallet/hooks';
import { useEffect, useState } from 'react';
import { Chakra_Petch } from '@next/font/google';
import { ThemeProvider } from 'styled-components';
import { useThemeStore, useWindowDimensions } from '@components/hooks';
import { config } from '@config';
import { themes } from '@themes/themes';
import { Nav } from '@components/Nav/Nav';
import { Footer } from '@components/Footer/Footer';
import { MainSectionDiv } from '@components/Common/Alignment';
import { Alert } from '@components/Common/Alert';
import NoSsr from '@components/Common/NoSsr';

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
  const { width } = useWindowDimensions();

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
    <main className={chakraPetch.className}>
      <ThemeProvider theme={themes[selectedThemeName]}>
        <Nav mobileIfLessThan={900} />
        <MainSectionDiv>
          <NoSsr>
            {width < 768 && (
              <Alert type="warning">
                SingleTxSwap is not supported on mobile devices. If you want to
                perform a trade, use desktop please.
              </Alert>
            )}
            <Component {...pageProps} />
          </NoSsr>
        </MainSectionDiv>
        <Footer />
      </ThemeProvider>
    </main>
  );
}
