import { Nav } from '@components/Nav/Nav';
import React, { useEffect, useState } from 'react';
import { Footer } from '@components/Footer/Footer';
import { WaitingPhaseHost } from '@components/Swap/WaitingPhaseHost';
import { useRouter } from 'next/router';
import { useWalletStore } from '@components/Wallet/hooks';
import { SwapWalletNotConnected } from '@components/Swap/SwapWalletNotConnected';
import { backendRequest } from '@utils/utils';
import { WaitingPhaseGuest } from '@components/Swap/WaitingPhaseGuest';
import { SwappingPhaseHost } from '@components/Swap/SwappingPhaseHost';
import { type ParticipantInfo } from '@components/Swap/types';
import { Div } from '@components/Common/Alignment';
import { LoadingPage } from '@components/Common/LoadingPage';

export default function Swap(): JSX.Element {
  const { address } = useWalletStore();
  const router = useRouter();
  const { tradingSessionId } = router.query;
  const { wallet } = useWalletStore();
  const [hostInfo, setHostInfo] = useState<ParticipantInfo | undefined>();
  const [guestInfo, setGuestInfo] = useState<ParticipantInfo | undefined>();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  });

  useEffect(() => {
    const fetchInfoMaybeEnter = async (): Promise<void> => {
      if (
        tradingSessionId === undefined ||
        address === undefined ||
        guestInfo !== undefined
      ) {
        return;
      }
      const infoResponse = await backendRequest(
        `/session/info?secret=${tradingSessionId}`
      );
      if (infoResponse.status !== 200) {
        console.error(infoResponse);
        setHostInfo(undefined);
        setGuestInfo(undefined);
        return;
      }
      if (infoResponse.body?.host !== undefined) {
        setHostInfo(infoResponse.body.host as ParticipantInfo);
      }
      if (infoResponse.body?.guest !== undefined) {
        setGuestInfo(infoResponse.body.guest as ParticipantInfo);
      } else if (infoResponse.body?.host?.address !== address) {
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
    const interval = setInterval(() => {
      fetchInfoMaybeEnter().catch(console.error);
    }, 3000);
    return () => {
      clearInterval(interval);
    };
  }, [address, tradingSessionId]);

  if (!isMounted) {
    return <LoadingPage />;
  }

  if (address === undefined) {
    return <SwapWalletNotConnected />;
  }
  if (typeof tradingSessionId !== 'string') {
    return <div>Invalid trading session id</div>; // TODO use something more reasonable here
  }

  if (hostInfo?.address !== address && guestInfo?.address !== address) {
    return <LoadingPage />;
  }

  if (wallet === undefined) {
    throw new Error('Wallet is undefined');
  }

  if (
    hostInfo !== undefined &&
    guestInfo !== undefined &&
    hostInfo?.address === address
  ) {
    return (
      <Div>
        <Nav />
        <SwappingPhaseHost
          wallet={wallet}
          tradingSessionId={tradingSessionId}
          hostInfo={hostInfo}
          guestInfo={guestInfo}
        />
        <Footer />
      </Div>
    );
  }

  return (
    <Div>
      <Nav />
      {address === hostInfo?.address && (
        <WaitingPhaseHost guestIsReady={guestInfo !== undefined} />
      )}
      {address === guestInfo?.address && (
        <WaitingPhaseGuest
          wallet={wallet}
          tradingSessionId={tradingSessionId}
        />
      )}
      <Footer />
    </Div>
  );
}
