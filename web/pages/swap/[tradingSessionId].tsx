import { Nav } from '@components/Nav/Nav';
import { ThemeProvider } from 'styled-components';
import { useThemeStore } from '@components/hooks';
import React, { useEffect, useState } from 'react';
import { Footer } from '@components/Footer/Footer';
import { WaitingPhaseCreator } from '@components/Swap/WaitingPhaseCreator';
import { useRouter } from 'next/router';
import { useWalletStore } from '@components/Wallet/hooks';
import { SwapWalletNotConnected } from '@components/Swap/SwapWalletNotConnected';
import { backendRequest } from '@utils/utils';
import { WaitingPhaseGuest } from '@components/Swap/WaitingPhaseGuest';
import NoSsr from '@components/Common/NoSsr';

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
      if (tradingSessionId === undefined || address === undefined) {
        return;
      }
      const whoamiResponse = await backendRequest(
        `/session/whoami?secret=${tradingSessionId}&address=${address}`
      );
      if (whoamiResponse.status !== 200) {
        setWhoami(undefined);
      } else if (whoamiResponse.body?.whoami !== undefined) {
        setWhoami(whoamiResponse.body.whoami);
      } else {
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
    return (
      <NoSsr>
        <SwapWalletNotConnected />
      </NoSsr>
    );
  }
  if (typeof tradingSessionId !== 'string') {
    return (
      <NoSsr>
        <div>Invalid trading session id</div>
      </NoSsr>
    ); // TODO use something more reasonable here
  }

  if (whoami !== creatorRepr && whoami !== guestRepr) {
    return (
      <NoSsr>
        <div>Loading...</div> // TODO make a loader page for this instead
      </NoSsr>
    );
  }

  return (
    <NoSsr>
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
    </NoSsr>
  );
}
