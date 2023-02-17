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
import { SwappingPhaseCreator } from '@components/Swap/SwappingPhaseCreator';
import { type ParticipantInfo } from '@components/Swap/types';

export default function Swap(): JSX.Element {
  const { address } = useWalletStore();
  const router = useRouter();
  const { tradingSessionId } = router.query;
  const { wallet } = useWalletStore();
  const { theme } = useThemeStore();
  const [creatorInfo, setCreatorInfo] = useState<ParticipantInfo | undefined>();
  const [guestInfo, setGuestInfo] = useState<ParticipantInfo | undefined>();

  useEffect(() => {
    const fetchInfoMaybeEnter = async (): Promise<void> => {
      if (tradingSessionId === undefined || address === undefined) {
        return;
      }
      const infoResponse = await backendRequest(
        `/session/info?secret=${tradingSessionId}`
      );
      if (infoResponse.status !== 200) {
        console.error(infoResponse);
        setCreatorInfo(undefined);
        setGuestInfo(undefined);
        return;
      }
      if (infoResponse.body?.creator !== undefined) {
        setCreatorInfo(infoResponse.body.creator as ParticipantInfo);
      }
      if (infoResponse.body?.guest !== undefined) {
        setGuestInfo(infoResponse.body.guest as ParticipantInfo);
      } else if (infoResponse.body?.creator?.address !== address) {
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
        const updatedInfoResponse = await backendRequest(
          `/session/info?secret=${tradingSessionId}`
        );
        if (
          updatedInfoResponse.status === 200 &&
          updatedInfoResponse.body?.guest !== undefined
        ) {
          setGuestInfo(updatedInfoResponse.body.guest as ParticipantInfo);
        }
      }
    };
    fetchInfoMaybeEnter().catch(console.error);
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

  if (creatorInfo?.address !== address && guestInfo?.address !== address) {
    return (
      <NoSsr>
        <div>Loading...</div> // TODO make a loader page for this instead
      </NoSsr>
    );
  }

  if (wallet === undefined) {
    throw new Error('Wallet is undefined');
  }

  if (
    creatorInfo !== undefined &&
    guestInfo !== undefined &&
    creatorInfo?.address === address
  ) {
    return (
      <NoSsr>
        <ThemeProvider theme={theme}>
          <Nav />
          <SwappingPhaseCreator
            wallet={wallet}
            tradingSessionId={tradingSessionId}
            creatorInfo={creatorInfo}
            guestInfo={guestInfo}
          />
          <Footer />
        </ThemeProvider>
      </NoSsr>
    );
  }

  return (
    <NoSsr>
      <ThemeProvider theme={theme}>
        <Nav />
        {address === creatorInfo?.address && (
          <WaitingPhaseCreator tradingSessionId={tradingSessionId} />
        )}
        {address === guestInfo?.address && (
          <WaitingPhaseGuest
            wallet={wallet}
            tradingSessionId={tradingSessionId}
          />
        )}
        <Footer />
      </ThemeProvider>
    </NoSsr>
  );
}
