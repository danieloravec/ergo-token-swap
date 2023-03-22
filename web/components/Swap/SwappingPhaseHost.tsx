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

export function SwappingPhaseHost(props: {
  wallet: Wallet;
  tradingSessionId: string;
  hostInfo: ParticipantInfo;
  guestInfo: ParticipantInfo;
}): JSX.Element {
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

  if (txId !== undefined) {
    return <TradingSessionFinished txId={txId} />;
  }

  return (
    <MainSectionDiv>
      {awaitingGuestSignature && (
        <Alert type="success">
          Please wait for the guest to validate and sign the transaction now.
          The page will be refreshed automatically.
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
          nfts={props.hostInfo.nfts}
          fungibleTokens={props.hostInfo.fungibleTokens}
          nanoErg={props.hostInfo.nanoErg}
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
              hostInfo={props.hostInfo}
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
  );
}
