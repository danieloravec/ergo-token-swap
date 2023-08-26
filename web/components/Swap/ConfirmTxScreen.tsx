import { type FungibleToken, type Nft } from '@components/Swap/types';
import { ButtonFitting } from '@components/Common/Button';
import {
  CenteredDivHorizontal,
  CenteredDivVertical,
  FlexDiv,
  FlexDivRow,
} from '@components/Common/Alignment';
import { NftList } from '@components/Profile/NftList';
import { FungibleList } from '@components/Profile/FungibleList';
import {
  Heading1,
  Heading2,
  Heading4,
  StrongNavs,
} from '@components/Common/Text';
import { spacing } from '@themes/spacing';
import styled, { useTheme } from 'styled-components';
import { type ReactNode, useState } from 'react';
import ColouredHeading from '@components/Swap/ColouredHeading';
import { Alert } from '@components/Common/Alert';

const NftModalList = (props: {
  nfts: Nft[];
  onContainsUnverified: () => void;
}): JSX.Element => {
  const theme = useTheme();

  return (
    <FlexDiv>
      <NftList
        rawNfts={props.nfts}
        onContainsUnverified={() => {
          props.onContainsUnverified();
        }}
        captionColor={theme.properties.colorNavsText}
      />
    </FlexDiv>
  );
};

const FungibleTokenModalList = (props: {
  fungibleTokens: FungibleToken[];
  nanoErg: bigint;
  onContainsUnverified: () => void;
}): JSX.Element => {
  const theme = useTheme();

  return (
    <FlexDiv style={{ width: '100%' }}>
      <FungibleList
        rawFungibles={props.fungibleTokens}
        nanoErg={props.nanoErg}
        onContainsUnverified={props.onContainsUnverified}
        captionColor={theme.properties.colorNavsText}
      />
    </FlexDiv>
  );
};

const TokenSummaryContainer = styled(FlexDiv)`
  background: ${({ theme }) => theme.properties.colorNavs};
  height: 60vh;
  overflow-y: auto;
  align-content: flex-start;
`;

const SectionHeading = styled(Heading2)`
  color: ${({ theme }) => theme.properties.colorNavsText};
`;

const TokenSummary = (props: {
  nfts: Nft[];
  fungibleTokens: FungibleToken[];
  nanoErg: bigint;
  heading: ReactNode;
}): JSX.Element => {
  const [containsUnverified, setContainsUnverified] = useState<boolean>(false);

  return (
    <TokenSummaryContainer>
      <ColouredHeading>{props.heading}</ColouredHeading>
      {containsUnverified ? (
        <Alert type="error">
          ⚠️ At least one of the assets is unverified! Please check it manually.
          ⚠️
        </Alert>
      ) : (
        <Alert type="success">All assets on this side are verified ✅</Alert>
      )}
      <FlexDiv style={{ padding: `${spacing.spacing_m}px` }}>
        <FlexDiv style={{ width: '100%' }}>
          {props.nfts.length > 0 && (
            <FlexDiv>
              <FlexDivRow>
                <SectionHeading>NFT:</SectionHeading>
              </FlexDivRow>
              <NftModalList
                nfts={props.nfts}
                onContainsUnverified={() => {
                  setContainsUnverified(true);
                }}
              />
            </FlexDiv>
          )}
        </FlexDiv>
        {(props.fungibleTokens.length > 0 || props.nanoErg > BigInt(0)) &&
          props.nfts.length > 0 && (
            <FlexDivRow style={{ height: '0px', border: '1px solid white' }} />
          )}
        <FlexDiv style={{ width: '100%' }}>
          {(props.fungibleTokens.length > 0 || props.nanoErg > 0) && (
            <FlexDivRow>
              <FlexDivRow>
                <SectionHeading>Fungible tokens:</SectionHeading>
              </FlexDivRow>
              <FungibleTokenModalList
                fungibleTokens={props.fungibleTokens}
                nanoErg={props.nanoErg}
                onContainsUnverified={() => {
                  setContainsUnverified(true);
                }}
              />
            </FlexDivRow>
          )}
        </FlexDiv>
      </FlexDiv>
    </TokenSummaryContainer>
  );
};

const ConfirmTxModalIntro = (props: {
  tradingSessionId: string;
}): JSX.Element => {
  const theme = useTheme();

  return (
    <FlexDivRow>
      <FlexDivRow>
        <CenteredDivHorizontal>
          <Heading1>Your trading partner prepared the following trade</Heading1>
        </CenteredDivHorizontal>
      </FlexDivRow>
      <FlexDivRow>
        <CenteredDivHorizontal>
          <Heading4>
            <CenteredDivHorizontal>
              Only click the
              <span
                style={{
                  color: theme.properties.colorPrimary,
                  marginLeft: `${spacing.spacing_xxxs}px`,
                  marginRight: `${spacing.spacing_xxxs}px`,
                }}
              >
                <i>Swap</i>
              </span>
              button after you carefully reviewed the trade.
              <br />
            </CenteredDivHorizontal>
            <CenteredDivHorizontal>
              Look for any unverified tokens. They are marked with 🚨. Verified
              assets are marked with ✅.
            </CenteredDivHorizontal>
          </Heading4>
        </CenteredDivHorizontal>
      </FlexDivRow>
    </FlexDivRow>
  );
};

const HeadingTextContainer = styled.span`
  font-size: 22px;
  padding: ${spacing.spacing_xxs}px;
`;

export const ConfirmTxScreen = (props: {
  nftsForA: Nft[];
  nftsForB: Nft[];
  fungibleTokensForA: FungibleToken[];
  fungibleTokensForB: FungibleToken[];
  nanoErgForA: bigint;
  nanoErgForB: bigint;
  onAgree: () => void;
  tradingSessionId: string;
}): JSX.Element => {
  const [isWaiting, setIsWaiting] = useState(false);

  const handleSwap = (): void => {
    setIsWaiting(true);
    props.onAgree();
  };

  return (
    <CenteredDivHorizontal>
      <FlexDivRow>
        <ConfirmTxModalIntro tradingSessionId={props.tradingSessionId} />
      </FlexDivRow>
      <CenteredDivHorizontal>
        <CenteredDivVertical style={{ width: '40%' }}>
          <TokenSummary
            nfts={props.nftsForB}
            fungibleTokens={props.fungibleTokensForB}
            nanoErg={props.nanoErgForB}
            heading={
              <HeadingTextContainer>
                You <StrongNavs>send</StrongNavs>:
              </HeadingTextContainer>
            }
          />
        </CenteredDivVertical>

        <CenteredDivVertical
          style={{ width: '10%', padding: `${spacing.spacing_xs}px` }}
        >
          <ButtonFitting disabled={isWaiting} onClick={handleSwap}>
            {isWaiting ? 'Waiting...' : 'Swap'}
          </ButtonFitting>
        </CenteredDivVertical>

        <CenteredDivVertical style={{ width: '40%' }}>
          <TokenSummary
            nfts={props.nftsForA}
            fungibleTokens={props.fungibleTokensForA}
            nanoErg={props.nanoErgForA}
            heading={
              <HeadingTextContainer>
                You <StrongNavs>receive</StrongNavs>:
              </HeadingTextContainer>
            }
          />
        </CenteredDivVertical>
      </CenteredDivHorizontal>
    </CenteredDivHorizontal>
  );
};
