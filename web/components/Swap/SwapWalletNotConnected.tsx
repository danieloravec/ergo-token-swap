import { ThemeProvider } from 'styled-components';
import {
  CenteredDivHorizontal,
  Div,
  MainSectionDiv,
} from '@components/Common/Alignment';
import { Heading3 } from '@components/Common/Text';
import { ConnectWalletButton } from '@components/Wallet/ConnectWalletButton';
import React from 'react';
import { useThemeStore } from '@components/hooks';
import { Nav } from '@components/Nav/Nav';
import { Footer } from '@components/Footer/Footer';

export function SwapWalletNotConnected(): JSX.Element {
  const { theme } = useThemeStore();
  return (
    <ThemeProvider theme={theme}>
      <Nav />
      <MainSectionDiv style={{ justifyContent: 'center' }}>
        <Div>
          <CenteredDivHorizontal>
            <Heading3>
              In order to access the trading session, please connect your
              wallet.
            </Heading3>
          </CenteredDivHorizontal>
          <CenteredDivHorizontal>
            <ConnectWalletButton />
          </CenteredDivHorizontal>
        </Div>
      </MainSectionDiv>
      <Footer />
    </ThemeProvider>
  );
}
