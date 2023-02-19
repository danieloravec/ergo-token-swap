import styled, { ThemeProvider, useTheme } from 'styled-components';
import { Heading3, Text, TextNavs, Strong } from '@components/Common/Text';
import React, { type ReactNode, useEffect, useState } from 'react';
import { CenteredDiv, Div, FlexDiv } from '@components/Common/Alignment';
import Image from 'next/image';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { Toggle } from '@components/Common/Toggle';
import { type FungibleToken, type Nft } from '@components/Swap/types';
import { explorerRequest } from '@ergo/utils';
import { assetIconMap } from '@mappers/assetIconMap';

const imgSize = 180;

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
  width: ${() => `${imgSize}px`};
  height: ${() => `${imgSize + 8}px`};
  margin-top: ${() => `${-imgSize - 8}px`};
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
  const [unknownAssetType, setUnknownAssetType] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (imageUrl === undefined) {
      const loadImage = async (): Promise<void> => {
        const issuingBoxResponse = await explorerRequest(
          `/assets/${props.nft.tokenId}/issuingBox`,
          0
        );
        if (issuingBoxResponse !== undefined && issuingBoxResponse.length > 0) {
          const registers = issuingBoxResponse[0].additionalRegisters;
          // Make sure it is an NFT picture artwork using R7 and get the image from R9
          if (
            registers.R7 !== undefined &&
            registers.R7 === '0e020101' &&
            registers.R9 !== undefined
          ) {
            let url = Buffer.from(registers.R9.substring(4), 'hex').toString(
              'utf-8'
            );
            if (url.startsWith('ipfs://')) {
              url = 'https://ipfs.io/ipfs/' + url.substring(7);
            } else if (url.startsWith('http://')) {
              url = 'https://' + url.substring(7);
            }
            setImageUrl(url);
          } else {
            setUnknownAssetType(true);
          }
        }
      };
      loadImage().catch(console.error);
    }
  });

  const Img =
    imageUrl === undefined ? (
      <CenteredDiv style={{ width: `${imgSize}px`, height: `${imgSize}px` }}>
        <TextNavs>
          {unknownAssetType ? 'UNKNOWN ASSET TYPE' : 'IMAGE LOADING...'}
        </TextNavs>
      </CenteredDiv>
    ) : (
      <Image
        src={imageUrl}
        alt={props.nft.name}
        width={imgSize}
        height={imgSize}
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
              maxWidth: imgSize,
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
  initialValue: bigint;
  onChange: (newAmount: bigint) => void;
}): JSX.Element {
  const theme = useTheme();
  const [displayAmt, setDisplayAmt] = useState(
    Number(props.initialValue) / Math.pow(10, props.fungibleToken.decimals)
  );
  const handleChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const newDisplayValue = Number(event.currentTarget.value);
    setDisplayAmt(newDisplayValue);
    props.onChange(
      BigInt(
        Math.floor(newDisplayValue * Math.pow(10, props.fungibleToken.decimals))
      )
    );
  };
  return (
    <ThemeProvider theme={theme}>
      <FlexDiv style={{ alignItems: 'center', paddingBottom: '20px' }}>
        <FungibleImageAndNameContainer>
          <Div>
            <Image
              src={
                assetIconMap[props.fungibleToken.tokenId] === undefined
                  ? `/icons/generic-coin.svg`
                  : `/icons/${assetIconMap[props.fungibleToken.tokenId]}`
              }
              alt={props.fungibleToken.name}
              width={80}
              height={80}
            />
          </Div>
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
                value={String(displayAmt)}
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
    console.log(`Fungible changed to: ${newAmount}`);
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
    console.log(`NanoErg changed to: ${newAmount}`);
    props.onChange(
      recordFromNftTokenIds(selectedNftIds),
      newAmount,
      selectedFungibleAmounts
    );
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
                  name: 'Ergo',
                  tokenId:
                    '0000000000000000000000000000000000000000000000000000000000000000',
                  amount: Number(props.nanoErg),
                  decimals: 9,
                }}
                initialValue={selectedNanoErg ?? BigInt(0)}
                onChange={handleNanoErgChange}
              />
              {props.fungibleTokens.map((fungibleToken: FungibleToken) => (
                <FungibleTokenDisplay
                  fungibleToken={fungibleToken}
                  key={fungibleToken.tokenId}
                  initialValue={
                    selectedFungibleAmounts[fungibleToken.tokenId] ?? BigInt(0)
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
