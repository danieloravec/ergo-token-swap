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
import NoSsr from '@components/Common/NoSsr';

const IntroductionContainer = styled.div`
  width: 550px;
`;

const startTradingSession = async (wallet: Wallet): Promise<string> => {
  const address = await wallet.getAddress();
  const sessionResponse = await backendRequest('/session/create', 'POST', {
    creatorAddr: address,
  });
  if (sessionResponse?.body?.secret === undefined) {
    throw new Error('Could not create trading session');
  }
  return sessionResponse.body.secret;
};

export function Introduction(): JSX.Element {
  const { wallet } = useWalletStore();
  const router = useRouter();
  return (
    <IntroductionContainer>
      <Heading1>Swap Ergo assets instantly </Heading1>
      <FlexDiv>
        <Spacer size={spacing.spacing_xs} vertical />
        <OrderedList style={{ fontSize: '20px' }}>
          <li>Connect your wallet (button in the upper right corner).</li>
          <li>
            Push <strong>Start trading session</strong> the button below.
          </li>
          <li>A private room for you and the other party will be created. </li>
          <li>Send them a generated link and wait for them to connect.</li>
          <li>Select assets to swap and sign the transaction.</li>
          <li>Wait for the other party to validate and sign it too.</li>
        </OrderedList>
      </FlexDiv>
      <NoSsr>
        <CenteredDivHorizontal>
          {wallet === undefined ? (
            <Button disabled>Wallet not connected</Button>
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
      </NoSsr>
    </IntroductionContainer>
  );
}
