import { Heading1, OrderedList, StrongBg } from '@components/Common/Text';
import styled, { useTheme } from 'styled-components';
import { Button } from '@components/Common/Button';
import { CenteredDivHorizontal, FlexDiv } from '@components/Common/Alignment';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { useWalletConnect, useWalletStore } from '@components/Wallet/hooks';
import { type Wallet } from '@ergo/wallet';
import { backendRequest } from '@utils/utils';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useWindowDimensions } from '@components/hooks';

const IntroductionContainer = styled.div`
  width: 550px;
  margin-top: ${`${spacing.spacing_xl}px`};

  @media (max-width: 768px) {
    width: 300px;
  }
`;

const startTradingSession = async (wallet: Wallet): Promise<string> => {
  const address = await wallet.getAddress();
  const sessionResponse = await backendRequest('/session/create', 'POST', {
    hostAddr: address,
  });
  if (sessionResponse?.body?.secret === undefined) {
    throw new Error('Could not create trading session');
  }
  return sessionResponse.body.secret;
};

const DisabledButton = styled(Button)`
  background-color: ${(props) => props.theme.properties.colorNavs};
`;

export function Introduction(): JSX.Element {
  const { wallet } = useWalletStore();
  const { connect, disconnect } = useWalletConnect();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { width } = useWindowDimensions();
  const theme = useTheme();

  useEffect(() => {
    const reconnect = async (): Promise<void> => {
      disconnect();
      await connect('nautilus').catch(console.error);
      setIsMounted(true);
    };
    reconnect().catch(console.error);
  }, []);

  return (
    <IntroductionContainer>
      <Heading1>
        Swap Ergo assets{' '}
        <span style={{ color: theme.properties.colorSecondary }}>securely</span>{' '}
        with people you{' '}
        <span style={{ color: theme.properties.colorSecondary }}>just</span>{' '}
        met!
      </Heading1>
      <FlexDiv>
        <Spacer size={spacing.spacing_xs} vertical />
        <OrderedList style={{ fontSize: '20px' }}>
          <li>Connect your wallet.</li>
          <li>
            Push the <StrongBg>Start Trading Session</StrongBg> button below.
          </li>
          <li>A private room for you and the other party will be created. </li>
          <li>Send them a generated link and wait for them to connect.</li>
          <li>Select assets to swap and sign the transaction.</li>
          <li>Wait for the other party to validate and sign it too.</li>
        </OrderedList>
      </FlexDiv>
      {width < 768 && (
        <CenteredDivHorizontal>
          <DisabledButton disabled>Only desktop supported</DisabledButton>
        </CenteredDivHorizontal>
      )}
      {width >= 768 && (
        <CenteredDivHorizontal>
          {!isMounted || wallet === undefined ? (
            <DisabledButton disabled>Wallet not connected</DisabledButton>
          ) : (
            <Button
              onClick={() => {
                const startSession = async (): Promise<void> => {
                  const tradingSessionId = await startTradingSession(wallet);
                  await router.push(`/swap/${tradingSessionId}`);
                };
                startSession().catch(console.error);
              }}
            >
              Start Trading Session
            </Button>
          )}
        </CenteredDivHorizontal>
      )}
    </IntroductionContainer>
  );
}
