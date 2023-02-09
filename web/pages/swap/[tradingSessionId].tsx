import { Nav } from '@components/Nav/Nav';
import { ThemeProvider } from 'styled-components';
import { useThemeStore } from '@components/hooks';
import React, { useEffect, useState } from 'react';
import { Footer } from '@components/Footer/Footer';
import { WaitingPhaseCreator } from '@components/Swap/WaitingPhaseCreator';
import { useRouter } from 'next/router';
// import {WaitingPhaseGuest} from "@components/Swap/WaitingPhaseGuest";
import { useWalletStore } from '@components/Wallet/hooks';
import { SwapWalletNotConnected } from '@components/Swap/SwapWalletNotConnected';
import { backendRequest } from '@utils/utils';
import { WaitingPhaseGuest } from '@components/Swap/WaitingPhaseGuest';

export default function Swap(): JSX.Element {
  const creatorRepr = 'creator';
  const guestRepr = 'guest';
  const { theme } = useThemeStore();
  const { address } = useWalletStore();
  const router = useRouter();
  const { tradingSessionId } = router.query;
  const [whoami, setWhoami] = useState<string | undefined>(undefined);
  useEffect(() => {
    const fetchWhoamiMaybeEnter = async (): Promise<void> => {
      const whoamiResponse = await backendRequest(
        `/whoami?secret=${tradingSessionId}&address=${address}`
      );
      if (whoamiResponse.status !== 200) {
        setWhoami(undefined);
      } else if (whoamiResponse.body?.whoami !== undefined) {
        setWhoami(whoamiResponse.body.whoami);
      } else if (address !== undefined) {
        const sessionEnterBody = {
          secret: tradingSessionId,
          guestAddr: address,
        };
        const sessionEnterResponse = await backendRequest(
          `/session/enter?secret=${tradingSessionId}&address=${address}`,
          'POST',
          sessionEnterBody
        );
        if (sessionEnterResponse.status !== 200) {
          throw new Error('Error entering session as a guest.');
        }
        setWhoami(guestRepr);
      }
    };
    fetchWhoamiMaybeEnter().catch(console.error);
  }, [address, tradingSessionId]);

  if (address === undefined) {
    return <SwapWalletNotConnected />;
  }
  if (typeof tradingSessionId !== 'string') {
    return <div>Invalid trading session id</div>; // TODO use something more reasonable here
  }

  if (whoami !== creatorRepr && whoami !== guestRepr) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Nav />
      {whoami === creatorRepr && (
        <WaitingPhaseCreator tradingSessionId={tradingSessionId} />
      )}
      {whoami === guestRepr && (
        <WaitingPhaseGuest tradingSessionId={tradingSessionId} />
      )}
      <Footer />
    </ThemeProvider>
  );
}
