import styled, { ThemeProvider, useTheme } from 'styled-components';
import { Heading3, Text, TextNavs, Strong } from '@components/Common/Text';
import React, { type ReactNode, useState } from 'react';
import { CenteredDiv, Div, FlexDiv } from '@components/Common/Alignment';
import Image from 'next/image';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { Toggle } from '@components/Common/Toggle';
import { type FungibleToken, type Nft } from '@components/Swap/types';

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
              <Text>
                <StrongSecondary>DESELECT</StrongSecondary>
              </Text>
            </ImageSelectedOverlay>
          </Div>
        ) : (
          <Div>{Img}</Div>
        )}
        <CenteredDiv>
          <TextNavs
            style={{
              marginBottom: spacing.spacing_xl,
              maxWidth: 80,
              overflowWrap: 'break-word',
            }}
          >
            {props.nft.name}
          </TextNavs>
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
  onChange: (newAmount: bigint) => void;
}): JSX.Element {
  const theme = useTheme();
  const [selectedAmt, setSelectedAmt] = useState(props.initialValue);
  const handleChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const newValue = Number(event.currentTarget.value);
    setSelectedAmt(newValue);
    props.onChange(
      BigInt(newValue * Math.pow(10, props.fungibleToken.decimals))
    );
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
          <TextNavs style={{ maxWidth: 80, overflowWrap: 'break-word' }}>
            {props.fungibleToken.name}
          </TextNavs>
        </FungibleImageAndNameContainer>
        <Div>
          <TextNavs>
            <FlexDiv>
              <TextNavs>
                <Strong>Available: </Strong>
              </TextNavs>
              <Spacer size={spacing.spacing_xxs} vertical={false} />
              {Number(
                props.fungibleToken.amount /
                  Math.pow(10, props.fungibleToken.decimals)
              ).toLocaleString('en-US', {
                maximumFractionDigits: props.fungibleToken.decimals,
                minimumFractionDigits: props.fungibleToken.decimals,
              })}
            </FlexDiv>
          </TextNavs>
          <TextNavs>
            <FlexDiv>
              <Strong>Selected: </Strong>
              <Spacer size={spacing.spacing_xxs} vertical={false} />
              <input
                style={{ width: '100px' }}
                value={String(selectedAmt)}
                type="number"
                onChange={handleChange}
              />
            </FlexDiv>
          </TextNavs>
        </Div>
      </FlexDiv>
    </ThemeProvider>
  );
}

const recordFromNftTokenIds = (
  nftTokenIds: string[]
): Record<string, bigint> => {
  const record: Record<string, bigint> = {};
  nftTokenIds.forEach((tokenId) => {
    record[tokenId] = BigInt(1);
  });
  return record;
};

export function TokenSelection(props: {
  width?: number;
  description: string;
  headingNft: ReactNode;
  headingFungible: ReactNode;
  nfts: Nft[];
  fungibleTokens: FungibleToken[];
  nanoErg: bigint;
  onChange: (
    newSelectedNfts: Record<string, bigint>,
    newSelectedNanoErg: bigint,
    newSelectedFungibleTokens: Record<string, bigint>
  ) => void;
}): JSX.Element {
  const theme = useTheme();
  const [selectedNftIds, setSelectedNftIds] = useState<string[]>([]); // We probably don't need a Set here
  const [selectedNanoErg, setSelectedNanoErg] = useState<bigint>(BigInt(0));
  const [selectedFungibleAmounts, setSelectedFungibleAmounts] = useState<
    Record<string, bigint>
  >({});
  const [showNftSelect, setShowNftSelect] = useState(true);
  const toggleNftSelected = (tokenId: string): void => {
    if (selectedNftIds.includes(tokenId)) {
      const newSelectedNftIds = selectedNftIds.filter((id) => id !== tokenId);
      setSelectedNftIds(newSelectedNftIds);
      props.onChange(
        recordFromNftTokenIds(newSelectedNftIds),
        selectedNanoErg,
        selectedFungibleAmounts
      );
    } else {
      setSelectedNftIds([...selectedNftIds, tokenId]);
      props.onChange(
        recordFromNftTokenIds([...selectedNftIds, tokenId]),
        selectedNanoErg,
        selectedFungibleAmounts
      );
    }
  };
  const handleFungibleChange = (tokenId: string, newAmount: bigint): void => {
    const updatedFungibleAmounts = {
      ...selectedFungibleAmounts,
      [tokenId]: newAmount,
    };
    setSelectedFungibleAmounts(updatedFungibleAmounts);
    props.onChange(
      recordFromNftTokenIds(selectedNftIds),
      selectedNanoErg,
      updatedFungibleAmounts
    );
  };
  const handleNanoErgChange = (newAmount: bigint): void => {
    setSelectedNanoErg(newAmount);
    props.onChange(
      recordFromNftTokenIds(selectedNftIds),
      newAmount,
      selectedFungibleAmounts
    );
  };
  const width = props.width ?? 420;
  const ergDecimals = 9;
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
          <TextNavs>
            {showNftSelect ? props.headingNft : props.headingFungible}
          </TextNavs>
        </TokenSelectionHeading>
        <TokenSelectionBody width={width}>
          {showNftSelect ? (
            props.nfts.map((nft) => (
              <NftDisplay
                nft={nft}
                key={nft.tokenId}
                onClick={toggleNftSelected}
                isSelected={selectedNftIds.includes(nft.tokenId)}
              />
            ))
          ) : (
            <Div>
              <FungibleTokenDisplay
                fungibleToken={{
                  imageUrl: 'https://cryptologos.cc/logos/ergo-erg-logo.png',
                  name: 'Ergo',
                  tokenId: '',
                  amount: Number(props.nanoErg),
                  decimals: ergDecimals,
                }}
                initialValue={
                  Number(selectedNanoErg) / Math.pow(10, ergDecimals) ?? 0
                }
                onChange={handleNanoErgChange}
              />
              {props.fungibleTokens.map((fungibleToken: FungibleToken) => (
                <FungibleTokenDisplay
                  fungibleToken={fungibleToken}
                  key={fungibleToken.tokenId}
                  initialValue={
                    Number(selectedFungibleAmounts[fungibleToken.tokenId]) /
                      Math.pow(10, fungibleToken.decimals) ?? 0
                  }
                  onChange={(newAmount: bigint) => {
                    handleFungibleChange(fungibleToken.tokenId, newAmount);
                  }}
                />
              ))}
            </Div>
          )}
        </TokenSelectionBody>
      </Div>
    </ThemeProvider>
  );
}
