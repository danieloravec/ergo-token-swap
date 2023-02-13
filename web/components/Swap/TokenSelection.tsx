import styled, { ThemeProvider, useTheme } from 'styled-components';
import {
  Heading3,
  Paragraph,
  ParagraphNavs,
  Strong,
} from '@components/Common/Text';
import { type ReactNode, useState } from 'react';
import { CenteredDiv, Div, FlexDiv } from '@components/Common/Alignment';
import Image from 'next/image';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { Toggle } from '@components/Common/Toggle';

export interface Nft {
  imageUrl: string;
  name: string;
  tokenId: string;
}

const TokenSelectionBody = styled.div<{ width: number }>`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
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
      src={props.nft.imageUrl}
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
        <ParagraphNavs style={{ marginBottom: spacing.spacing_xl }}>
          {props.nft.name}
        </ParagraphNavs>
      </ThemeProvider>
    </div>
  );
}

export function TokenSelection(props: {
  width?: number;
  description: string;
  heading: ReactNode;
  nfts: Nft[];
}): JSX.Element {
  const theme = useTheme();
  const [selectedNftIds, setSelectedNftIds] = useState<string[]>([]); // We probably don't need a Set here
  const toggleNftSelected = (tokenId: string): void => {
    if (selectedNftIds.includes(tokenId)) {
      setSelectedNftIds(selectedNftIds.filter((id) => id !== tokenId));
    } else {
      setSelectedNftIds([...selectedNftIds, tokenId]);
    }
  };
  const width = props.width ?? 420;
  return (
    <ThemeProvider theme={theme}>
      <FlexDiv style={{ width, justifyContent: 'space-between' }}>
        <Heading3 style={{ width: Math.floor(width / 2) }}>
          {props.description}
        </Heading3>
        <Toggle
          leftOption="NFT"
          rightOption="Fungible"
          onToggle={(toggledToSide: string) => {
            console.log(toggledToSide);
          }}
        />
      </FlexDiv>
      <TokenSelectionHeading width={width}>
        <ParagraphNavs>{props.heading}</ParagraphNavs>
      </TokenSelectionHeading>
      <Spacer size={spacing.spacing_xxxl} vertical={false} />
      <TokenSelectionBody width={width}>
        {props.nfts.map((nft) => (
          <NftDisplay
            nft={nft}
            key={nft.tokenId}
            onClick={toggleNftSelected}
            isSelected={selectedNftIds.includes(nft.tokenId)}
          />
        ))}
      </TokenSelectionBody>
    </ThemeProvider>
  );
}
