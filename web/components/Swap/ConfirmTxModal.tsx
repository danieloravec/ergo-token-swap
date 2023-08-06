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
import { type ReactNode } from 'react';
import ColouredHeading from '@components/Swap/ColouredHeading';

const NftModalList = (props: { nfts: Nft[] }): JSX.Element => {
  const theme = useTheme();

  return (
    <FlexDiv>
      <NftList
        rawNfts={props.nfts}
        captionColor={theme.properties.colorNavsText}
      />
    </FlexDiv>
  );
};

const FungibleTokenModalList = (props: {
  fungibleTokens: FungibleToken[];
  nanoErg: bigint;
}): JSX.Element => {
  const theme = useTheme();

  return (
    <FlexDiv style={{ width: '100%' }}>
      <FungibleList
        rawFungibles={props.fungibleTokens}
        nanoErg={props.nanoErg}
        captionColor={theme.properties.colorNavsText}
      />
    </FlexDiv>
  );
};

const TokenSummaryContainer = styled(FlexDiv)`
  background: ${({ theme }) => theme.properties.colorNavs};
  height: 60vh;
  overflow-y: auto;
`;

const TokenSummary = (props: {
  nfts: Nft[];
  fungibleTokens: FungibleToken[];
  nanoErg: bigint;
  heading: ReactNode;
}): JSX.Element => {
  const theme = useTheme();

  const SectionHeading = styled(Heading2)`
    color: ${theme.properties.colorNavsText};
  `;

  return (
    <TokenSummaryContainer>
      <ColouredHeading>{props.heading}</ColouredHeading>
      <FlexDiv style={{ padding: `${spacing.spacing_m}px` }}>
        <FlexDiv style={{ width: '100%' }}>
          <FlexDivRow>
            <SectionHeading>NFT:</SectionHeading>
          </FlexDivRow>
          {props.nfts.length > 0 && <NftModalList nfts={props.nfts} />}
        </FlexDiv>
        <FlexDivRow style={{ height: '0px', border: '1px solid white' }} />
        <FlexDiv style={{ width: '100%' }}>
          {(props.fungibleTokens.length > 0 || props.nanoErg > 0) && (
            <FlexDivRow>
              <FlexDivRow>
                <SectionHeading>Fungible tokens:</SectionHeading>
              </FlexDivRow>
              <FungibleTokenModalList
                fungibleTokens={props.fungibleTokens}
                nanoErg={props.nanoErg}
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

export const ConfirmTxModal = (props: {
  nftsForA: Nft[];
  nftsForB: Nft[];
  fungibleTokensForA: FungibleToken[];
  fungibleTokensForB: FungibleToken[];
  nanoErgForA: bigint;
  nanoErgForB: bigint;
  onAgree: () => void;
  tradingSessionId: string;
}): JSX.Element => {
  const HeadingTextContainer = styled.span`
    font-size: 22px;
  `;

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
          <ButtonFitting onClick={props.onAgree}>Swap</ButtonFitting>
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
