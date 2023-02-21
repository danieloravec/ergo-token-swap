import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useWalletConnect } from '@components/Wallet/hooks';
import { useEffect } from 'react';
import { Chakra_Petch } from '@next/font/google';
import { ThemeProvider } from 'styled-components';
import { useThemeStore } from '@components/hooks';
import { config } from '@config';
import { themes } from '@themes/themes';

const chakraPetch = Chakra_Petch({
  weight: '500',
  subsets: ['latin'],
});

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  const { reconnect } = useWalletConnect();
  const { theme, setThemeName, setTheme } = useThemeStore();
  const defaultTheme = themes[config.defaultThemeName];

  useEffect(() => {
    const load = async (): Promise<void> => {
      await reconnect();
    };
    void load();
  }, []);

  useEffect(() => {
    if (theme === undefined) {
      setThemeName(config.defaultThemeName);
      setTheme(defaultTheme);
    }
  });

  return (
    <main className={chakraPetch.className}>
      <ThemeProvider theme={theme === undefined ? defaultTheme : theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </main>
  );
}
