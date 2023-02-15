import styled, { ThemeProvider, useTheme } from 'styled-components';
import {
  Heading3,
  Paragraph,
  ParagraphNavs,
  Strong,
} from '@components/Common/Text';
import React, { type ReactNode, useState } from 'react';
import {
  CenteredDiv,
  Div,
  FlexDiv,
} from '@components/Common/Alignment';
import Image from 'next/image';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { Toggle } from '@components/Common/Toggle';

export interface Nft {
  imageUrl: string;
  name: string;
  tokenId: string;
}

export interface FungibleToken {
  imageUrl: string;
  name: string;
  tokenId: string;
  amount: number;
  decimals: number;
}

const TokenSelectionBody = styled.div<{ width: number }>`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-content: flex-start;
  background: ${(props) => props.theme.properties.colorNavs};
  width: ${(props) => `${props.width}px`};
  height: 600px;
  box-shadow: ${(props) => {
    return `0 3px 10px ${props.theme.properties.colorNavs}`;
  }};
  overflow-y: auto;
  padding: ${() => `${spacing.spacing_xs}px`};
`;

const TokenSelectionHeading = styled.div<{ width: number }>`
  height: 40px;
  width: ${(props) => `${props.width}px`};
  background: ${(props) => props.theme.properties.colorSecondary};
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  position: relative;
  align-content: center;
`;

const ImageSelectedOverlay = styled(CenteredDiv)`
  backdrop-filter: blur(4px) grayscale(100%) brightness(0.4);
  //backdrop-filter: grayscale(100%);
  width: 180px;
  height: 184px;
  margin-top: -184px;
`;

const StrongSecondary = styled(Strong)`
  color: ${(props) => props.theme.properties.colorNavsText};
`;

function NftDisplay(props: {
  nft: Nft;
  isSelected: boolean;
  onClick: (tokenId: string) => void;
}): JSX.Element {
  const theme = useTheme();
  const Img = (
    <Image
      src={
        props.nft.imageUrl === 'unknown'
          ? 'https://www.ergnomes.io/assets/images/home/thornyhero.webP'
          : props.nft.imageUrl
      }
      alt={props.nft.name}
      width={180}
      height={180}
      onClick={() => {
        props.onClick(props.nft.tokenId);
      }}
    />
  );
  return (
    <div>
      <ThemeProvider theme={theme}>
        {props.isSelected ? (
          <Div>
            {Img}
            <ImageSelectedOverlay
              onClick={() => {
                props.onClick(props.nft.tokenId);
              }}
            >
              <Paragraph>
                <StrongSecondary>DESELECT</StrongSecondary>
              </Paragraph>
            </ImageSelectedOverlay>
          </Div>
        ) : (
          <Div>{Img}</Div>
        )}
        <CenteredDiv>
          <ParagraphNavs
            style={{
              marginBottom: spacing.spacing_xl,
              maxWidth: 80,
              overflowWrap: 'break-word',
            }}
          >
            {props.nft.name}
          </ParagraphNavs>
        </CenteredDiv>
      </ThemeProvider>
    </div>
  );
}

const FungibleImageAndNameContainer = styled.div`
  width: 80px;
`;

function FungibleTokenDisplay(props: {
  fungibleToken: FungibleToken;
  initialValue: number;
  onChange: (newAmount: number) => void;
}): JSX.Element {
  const theme = useTheme();
  const [selectedAmt, setSelectedAmt] = useState(props.initialValue);
  const handleChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const newValue = Number(event.currentTarget.value);
    setSelectedAmt(newValue);
    props.onChange(newValue);
  };
  return (
    <ThemeProvider theme={theme}>
      <FlexDiv style={{ alignItems: 'top' }}>
        <FungibleImageAndNameContainer>
          <Image
            src={
              props.fungibleToken.imageUrl === 'unknown'
                ? 'https://www.ergnomes.io/assets/images/home/thornyhero.webP'
                : props.fungibleToken.imageUrl
            }
            alt={props.fungibleToken.name}
            width={80}
            height={80}
          />
          <ParagraphNavs style={{ maxWidth: 80, overflowWrap: 'break-word' }}>
            {props.fungibleToken.name}
          </ParagraphNavs>
        </FungibleImageAndNameContainer>
        <Div>
          <ParagraphNavs>
            <FlexDiv>
              <Strong>Available: </Strong>
              <Spacer size={spacing.spacing_xxs} vertical={false} />
              {props.fungibleToken.amount.toLocaleString('en-US', {
                maximumFractionDigits: props.fungibleToken.decimals,
                minimumFractionDigits: props.fungibleToken.decimals,
              })}
            </FlexDiv>
          </ParagraphNavs>
          <ParagraphNavs>
            <FlexDiv>
              <Strong>Selected: </Strong>
              <Spacer size={spacing.spacing_xxs} vertical={false} />
              <input
                style={{ width: '100px' }}
                value={selectedAmt}
                type="number"
                onChange={handleChange}
              />
            </FlexDiv>
          </ParagraphNavs>
        </Div>
      </FlexDiv>
    </ThemeProvider>
  );
}

export function TokenSelection(props: {
  width?: number;
  description: string;
  headingNft: ReactNode;
  headingFungible: ReactNode;
  nfts: Nft[];
  fungibleTokens: FungibleToken[];
}): JSX.Element {
  const theme = useTheme();
  const [selectedNftIds, setSelectedNftIds] = useState<string[]>([]); // We probably don't need a Set here
  const [selectedFungibleAmounts, setSelectedFungibleAmounts] = useState<
    Record<string, number>
  >({});
  const [showNftSelect, setShowNftSelect] = useState(true);
  const toggleNftSelected = (tokenId: string): void => {
    if (selectedNftIds.includes(tokenId)) {
      setSelectedNftIds(selectedNftIds.filter((id) => id !== tokenId));
    } else {
      setSelectedNftIds([...selectedNftIds, tokenId]);
    }
  };
  const handleFungibleChange = (tokenId: string, newAmount: number): void => {
    const updatedFungibleAmounts = {
      ...selectedFungibleAmounts,
      [tokenId]: newAmount,
    };
    setSelectedFungibleAmounts(updatedFungibleAmounts);
  };
  const width = props.width ?? 420;
  return (
    <ThemeProvider theme={theme}>
      <Div>
        <FlexDiv style={{ justifyContent: 'space-between' }}>
          <Heading3 style={{ width: Math.floor(width / 2) }}>
            {props.description}
          </Heading3>
          <Toggle
            leftOption="NFT"
            rightOption="Fungible"
            onToggle={(toggledToSide: 'left' | 'right') => {
              if (toggledToSide === 'left') {
                setShowNftSelect(true);
              } else {
                setShowNftSelect(false);
              }
            }}
          />
        </FlexDiv>
        <TokenSelectionHeading width={width}>
          <ParagraphNavs>
            {showNftSelect ? props.headingNft : props.headingFungible}
          </ParagraphNavs>
        </TokenSelectionHeading>
        <TokenSelectionBody width={width}>
          {showNftSelect
            ? props.nfts.map((nft) => (
                <NftDisplay
                  nft={nft}
                  key={nft.tokenId}
                  onClick={toggleNftSelected}
                  isSelected={selectedNftIds.includes(nft.tokenId)}
                />
              ))
            : props.fungibleTokens.map((fungibleToken: FungibleToken) => (
                <FungibleTokenDisplay
                  fungibleToken={fungibleToken}
                  key={fungibleToken.tokenId}
                  initialValue={
                    selectedFungibleAmounts[fungibleToken.tokenId] ?? 0
                  }
                  onChange={(newAmount: number) => {
                    handleFungibleChange(fungibleToken.tokenId, newAmount);
                  }}
                />
              ))}
        </TokenSelectionBody>
      </Div>
    </ThemeProvider>
  );
}
