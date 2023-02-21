import { ThemeProvider, useTheme } from 'styled-components';
import { CenteredDiv, Div, MainSectionDiv } from '@components/Common/Alignment';
import { TokenSelection } from '@components/Swap/TokenSelection';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { useState } from 'react';
import { type Wallet } from '@ergo/wallet';
import { type ParticipantInfo } from '@components/Swap/types';
import { SwapButton } from '@components/Swap/SwapButton';
import { TradingSessionFinished } from '@components/Swap/TradingSessionFinished';
import { Alert } from '@components/Common/Alert';

export function SwappingPhaseCreator(props: {
  wallet: Wallet;
  tradingSessionId: string;
  creatorInfo: ParticipantInfo;
  guestInfo: ParticipantInfo;
}): JSX.Element {
  const theme = useTheme();
  const [selectedNftsA, setSelectedNftsA] = useState<Record<string, bigint>>(
    {}
  );
  const [selectedFungibleTokensA, setSelectedFungibleTokensA] = useState<
    Record<string, bigint>
  >({});
  const [selectedNanoErgA, setSelectedNanoErgA] = useState(BigInt(0));
  const [selectedNftsB, setSelectedNftsB] = useState<Record<string, bigint>>(
    {}
  );
  const [selectedFungibleTokensB, setSelectedFungibleTokensB] = useState<
    Record<string, bigint>
  >({});
  const [selectedNanoErgB, setSelectedNanoErgB] = useState(BigInt(0));
  const [awaitingGuestSignature, setAwaitingGuestSignature] = useState(false);
  const [txId, setTxId] = useState<string | undefined>(undefined);

  // TODO implement a hook to check if tx was submitted and use it to render success text

  if (txId !== undefined) {
    return (
      <ThemeProvider theme={theme}>
        <TradingSessionFinished txId={txId} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <MainSectionDiv>
        {awaitingGuestSignature && (
          <Alert type="success">
            Please wait for the guest to validate and sign the transaction now.
            Don't refresh the page.
          </Alert>
        )}
        <CenteredDiv>
          <TokenSelection
            description="YOUR WALLET"
            headingNft={
              <span>
                Select tokens to <strong>send</strong> by clicking them.
              </span>
            }
            headingFungible={
              <span>
                Specify amounts of tokens to <strong>send</strong>.
              </span>
            }
            nfts={props.creatorInfo.nfts}
            fungibleTokens={props.creatorInfo.fungibleTokens}
            nanoErg={props.creatorInfo.nanoErg}
            onChange={(
              newSelectedNfts: Record<string, bigint>,
              newSelectedNanoErg: bigint,
              newSelectedFungibleTokens: Record<string, bigint>
            ) => {
              setSelectedNftsA(newSelectedNfts);
              setSelectedNanoErgA(newSelectedNanoErg);
              setSelectedFungibleTokensA(newSelectedFungibleTokens);
            }}
          />
          <Spacer size={spacing.spacing_xxxl} vertical={false} />
          <Div>
            <CenteredDiv style={{ height: '100%' }}>
              <SwapButton
                tradingSessionId={props.tradingSessionId}
                wallet={props.wallet}
                creatorInfo={props.creatorInfo}
                guestInfo={props.guestInfo}
                selectedNftsA={selectedNftsA}
                selectedFungibleTokensA={selectedFungibleTokensA}
                selectedNanoErgA={selectedNanoErgA}
                selectedNftsB={selectedNftsB}
                selectedFungibleTokensB={selectedFungibleTokensB}
                selectedNanoErgB={selectedNanoErgB}
                notifyAwaitingGuestSignature={(isAwaiting: boolean) => {
                  setAwaitingGuestSignature(isAwaiting);
                }}
                setTxId={setTxId}
              />
            </CenteredDiv>
          </Div>
          <Spacer size={spacing.spacing_xxxl} vertical={false} />
          <TokenSelection
            description="GUEST WALLET"
            headingNft={
              <span>
                Select tokens to <strong>receive</strong> by clicking them.
              </span>
            }
            headingFungible={
              <span>
                Specify amounts of tokens to <strong>receive</strong>.
              </span>
            }
            nfts={props.guestInfo.nfts}
            fungibleTokens={props.guestInfo.fungibleTokens}
            nanoErg={props.guestInfo.nanoErg}
            onChange={(
              newSelectedNfts: Record<string, bigint>,
              newSelectedNanoErg: bigint,
              newSelectedFungibleTokens: Record<string, bigint>
            ) => {
              setSelectedNftsB(newSelectedNfts);
              setSelectedNanoErgB(newSelectedNanoErg);
              setSelectedFungibleTokensB(newSelectedFungibleTokens);
            }}
          />
        </CenteredDiv>
      </MainSectionDiv>
    </ThemeProvider>
  );
}
