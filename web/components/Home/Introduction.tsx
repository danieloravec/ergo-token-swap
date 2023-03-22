import { Heading1, OrderedList } from '@components/Common/Text';
import styled from 'styled-components';
import { Button } from '@components/Common/Button';
import { CenteredDivHorizontal, FlexDiv } from '@components/Common/Alignment';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { useWalletStore } from '@components/Wallet/hooks';
import { type Wallet } from '@ergo/wallet';
import { backendRequest } from '@utils/utils';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const IntroductionContainer = styled.div`
  width: 550px;
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
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  });

  return (
    <IntroductionContainer>
      <Heading1>SWAP ERGO ASSETS INSTANTLY</Heading1>
      <FlexDiv>
        <Spacer size={spacing.spacing_xs} vertical />
        <OrderedList style={{ fontSize: '20px' }}>
          <li>Connect your wallet (button in the upper right corner).</li>
          <li>
            Push <strong>Start Trading Session</strong> the button below.
          </li>
          <li>A private room for you and the other party will be created. </li>
          <li>Send them a generated link and wait for them to connect.</li>
          <li>Select assets to swap and sign the transaction.</li>
          <li>Wait for the other party to validate and sign it too.</li>
        </OrderedList>
      </FlexDiv>
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
    </IntroductionContainer>
  );
}
