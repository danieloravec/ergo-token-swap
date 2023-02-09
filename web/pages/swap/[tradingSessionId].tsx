import { Nav } from '@components/Nav/Nav';
import { ThemeProvider } from 'styled-components';
import { useThemeStore } from '@components/hooks';
import React from 'react';
import { Footer } from '@components/Footer/Footer';
import { WaitingPhaseCreator } from '@components/Swap/WaitingPhaseCreator';
import { useRouter } from 'next/router';
// import {WaitingPhaseGuest} from "@components/Swap/WaitingPhaseGuest";
// import {backendRequest} from "@utils/utils";
import { useWalletStore } from '@components/Wallet/hooks';
import { SwapWalletNotConnected } from '@components/Swap/SwapWalletNotConnected';

export default function Swap(): JSX.Element {
  const { theme } = useThemeStore();
  const { address } = useWalletStore();
  if (address === undefined) {
    return <SwapWalletNotConnected />;
  }
  const router = useRouter();
  const { tradingSessionId } = router.query;
  if (typeof tradingSessionId !== 'string') {
    return <div>Invalid trading session id</div>; // TODO use something more reasonable here
  }

  // const whoami = await backendRequest(`/whoami?secret=${tradingSessionId}&address=${address}`)

  return (
    <ThemeProvider theme={theme}>
      <Nav />
      <WaitingPhaseCreator tradingSessionId={tradingSessionId} />
      <Footer />
    </ThemeProvider>
  );
}
