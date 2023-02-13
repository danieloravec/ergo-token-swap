import styled, { ThemeProvider, useTheme } from 'styled-components';
import { ParagraphNavs } from '@components/Common/Text';
import { type ReactNode } from 'react';
import { CenteredDivHorizontal } from '@components/Common/Alignment';
import Image from 'next/image';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { config } from '@config';

export interface Nft {
  imageUrl: string;
  name: string;
  tokenId: string;
}

const TokenSelectionBody = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  background: ${(props) => props.theme.properties.colorNavs};
  width: 420px;
  height: 600px;
  box-shadow: ${(props) => {
    return `0 3px 10px ${props.theme.properties.colorNavs}`;
  }};
  overflow-y: auto;
  padding: ${() => `${spacing.spacing_xs}px`};
`;

const TokenSelectionHeading = styled(CenteredDivHorizontal)`
  height: 40px;
  width: 420px;
  background: ${(props) => props.theme.properties.colorSecondary};
  display: flex;
`;

function NftDisplay(props: { nft: Nft }): JSX.Element {
  const theme = useTheme();
  return (
    <a href={`${config.explorerFrontendUrl}/en/token/${props.nft.tokenId}`}>
      <ThemeProvider theme={theme}>
        <Image
          src={props.nft.imageUrl}
          alt={props.nft.name}
          width={180}
          height={180}
        />
        <ParagraphNavs style={{ marginBottom: spacing.spacing_xl }}>
          {props.nft.name}
        </ParagraphNavs>
      </ThemeProvider>
    </a>
  );
}

export function TokenSelection(props: {
  heading: ReactNode;
  nfts: Nft[];
}): JSX.Element {
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <TokenSelectionHeading>
        <ParagraphNavs>{props.heading}</ParagraphNavs>
      </TokenSelectionHeading>
      <Spacer size={spacing.spacing_xxxl} vertical={false} />
      <TokenSelectionBody>
        {props.nfts.map((nft) => (
          <NftDisplay nft={nft} />
        ))}
      </TokenSelectionBody>
    </ThemeProvider>
  );
}
