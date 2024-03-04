import {
  CenteredDiv,
  Div,
  FlexDiv,
  CenteredDivHorizontal,
} from '@components/Common/Alignment';
import { TokenSelection } from '@components/Swap/TokenSelection';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import React, { useEffect, useState } from 'react';
import { type Wallet } from '@ergo/wallet';
import {
  type FungibleToken,
  type Nft,
  type ParticipantInfo,
} from '@components/Swap/types';
import { SwapButton } from '@components/Swap/SwapButton';
import { TradingSessionFinished } from '@components/Swap/TradingSessionFinished';
import { Alert } from '@components/Common/Alert';
import { fetchFinishedTxId } from '@components/Swap/utils';
import { StrongNavs } from '@components/Common/Text';
import styled from 'styled-components';

const TokenDisplayHeadingSpan = styled.span`
  padding: ${spacing.spacing_xxs}px;
`;

export function SwappingPhaseHost(props: {
  wallet: Wallet;
  tradingSessionId: string;
  hostInfo: ParticipantInfo;
  guestInfo: ParticipantInfo;
}): JSX.Element {
  const [selectedNftsA, setSelectedNftsA] = useState<Record<string, bigint>>(
    {}
  );
  const [selectedNftsADetails, setSelectedNftsADetails] = useState<Nft[]>([]);
  const [selectedFungibleTokensA, setSelectedFungibleTokensA] = useState<
    Record<string, bigint>
  >({});
  const [selectedFungibleTokensADetails, setSelectedFungibleTokensADetails] =
    useState<FungibleToken[]>([]);
  const [selectedNanoErgA, setSelectedNanoErgA] = useState(BigInt(0));
  const [selectedNftsB, setSelectedNftsB] = useState<Record<string, bigint>>(
    {}
  );
  const [selectedNftsBDetails, setSelectedNftsBDetails] = useState<Nft[]>([]);
  const [selectedFungibleTokensB, setSelectedFungibleTokensB] = useState<
    Record<string, bigint>
  >({});
  const [selectedFungibleTokensBDetails, setSelectedFungibleTokensBDetails] =
    useState<FungibleToken[]>([]);
  const [selectedNanoErgB, setSelectedNanoErgB] = useState(BigInt(0));
  const [awaitingGuestSignature, setAwaitingGuestSignature] = useState(false);
  const [txId, setTxId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchIsFinished = async (): Promise<void> => {
      const maybeTxId = await fetchFinishedTxId(props.tradingSessionId);
      setTxId(maybeTxId);
    };
    fetchIsFinished().catch(console.error);
  });

  if (txId !== undefined) {
    return <TradingSessionFinished txId={txId} />;
  }

  return (
    <FlexDiv>
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
            <TokenDisplayHeadingSpan>
              Select tokens to <StrongNavs>send</StrongNavs> by clicking them.
            </TokenDisplayHeadingSpan>
          }
          headingFungible={
            <TokenDisplayHeadingSpan>
              Specify amounts of tokens to <StrongNavs>send</StrongNavs>.
            </TokenDisplayHeadingSpan>
          }
          nfts={props.hostInfo.nfts}
          fungibleTokens={props.hostInfo.fungibleTokens}
          nanoErg={props.hostInfo.nanoErg}
          onChange={(
            newSelectedNfts: Record<string, bigint>,
            newSelectedNftsDetails: Nft[],
            newSelectedNanoErg: bigint,
            newSelectedFungibleTokens: Record<string, bigint>,
            newSelectedFungibleTokensDetails: FungibleToken[]
          ) => {
            setSelectedNftsA(newSelectedNfts);
            setSelectedNftsADetails(newSelectedNftsDetails);
            setSelectedNanoErgA(newSelectedNanoErg);
            setSelectedFungibleTokensA(newSelectedFungibleTokens);
            setSelectedFungibleTokensADetails(newSelectedFungibleTokensDetails);
          }}
        />
        <Spacer size={spacing.spacing_xxxl} vertical={false} />
        <TokenSelection
          description="GUEST WALLET"
          headingNft={
            <TokenDisplayHeadingSpan>
              Select tokens to <StrongNavs>receive</StrongNavs> by clicking
              them.
            </TokenDisplayHeadingSpan>
          }
          headingFungible={
            <TokenDisplayHeadingSpan>
              Specify amounts of tokens to <StrongNavs>receive</StrongNavs>.
            </TokenDisplayHeadingSpan>
          }
          nfts={props.guestInfo.nfts}
          fungibleTokens={props.guestInfo.fungibleTokens}
          nanoErg={props.guestInfo.nanoErg}
          onChange={(
            newSelectedNfts: Record<string, bigint>,
            newSelectedNftsDetails: Nft[],
            newSelectedNanoErg: bigint,
            newSelectedFungibleTokens: Record<string, bigint>,
            newSelectedFungibleTokensDetails: FungibleToken[]
          ) => {
            setSelectedNftsB(newSelectedNfts);
            setSelectedNftsBDetails(newSelectedNftsDetails);
            setSelectedNanoErgB(newSelectedNanoErg);
            setSelectedFungibleTokensB(newSelectedFungibleTokens);
            setSelectedFungibleTokensBDetails(newSelectedFungibleTokensDetails);
          }}
        />
      </CenteredDiv>
      <Spacer size={spacing.spacing_xxl} vertical />
      <Div style={{ width: '100%' }}>
        <CenteredDivHorizontal style={{ height: '100%' }}>
          <SwapButton
            tradingSessionId={props.tradingSessionId}
            wallet={props.wallet}
            hostInfo={props.hostInfo}
            guestInfo={props.guestInfo}
            selectedNftsA={selectedNftsA}
            selectedNftsADetails={selectedNftsADetails}
            selectedFungibleTokensA={selectedFungibleTokensA}
            selectedFungibleTokensADetails={selectedFungibleTokensADetails}
            selectedNanoErgA={selectedNanoErgA}
            selectedNftsB={selectedNftsB}
            selectedNftsBDetails={selectedNftsBDetails}
            selectedFungibleTokensB={selectedFungibleTokensB}
            selectedFungibleTokensBDetails={selectedFungibleTokensBDetails}
            selectedNanoErgB={selectedNanoErgB}
            notifyAwaitingGuestSignature={(isAwaiting: boolean) => {
              setAwaitingGuestSignature(isAwaiting);
            }}
            setTxId={setTxId}
          />
        </CenteredDivHorizontal>
      </Div>
    </FlexDiv>
  );
}
