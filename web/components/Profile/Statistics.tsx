import React from 'react';
import { CenteredDivHorizontal, FlexDiv } from '@components/Common/Alignment';
import { Toggle } from '@components/Common/Toggle';
import { A, Heading2, Strong, Text } from '@components/Common/Text';
import { useTheme } from 'styled-components';
import { type FungibleStats, type NftStats } from '@components/Profile/types';
import {
  FungibleTokenImage,
  NftDisplay,
} from '@components/Swap/TokenSelection';
import { config } from '@config';
import { ExternalLink } from '@components/Icons/ExternalLink';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { decimalize, shortenString } from '@utils/formatters';
import { type Nft } from '@components/Swap/types';

const VolumeDeltasDisplay = (props: {
  amountBought: bigint;
  amountSold: bigint;
  decimals: number;
}): JSX.Element => {
  const theme = useTheme();

  return (
    <Strong style={{ fontSize: '20px' }}>
      <span
        style={{
          color:
            props.amountBought === BigInt(0)
              ? theme.properties.colorBgText
              : theme.properties.colorPrimary,
        }}
      >
        +{String(decimalize(props.amountBought, props.decimals))}
      </span>
      <span> / </span>
      <span
        style={{
          color:
            props.amountSold === BigInt(0)
              ? theme.properties.colorBgText
              : theme.properties.colorSecondary,
        }}
      >
        -{String(decimalize(props.amountSold, props.decimals))}
      </span>
    </Strong>
  );
};

const FungibleVolumeTableEntry = (props: {
  stat: FungibleStats;
}): JSX.Element => {
  const theme = useTheme();

  return (
    <FlexDiv
      style={{
        width: '100%',
        border: `1px solid ${theme.properties.colorNavs}`,
      }}
    >
      <FlexDiv style={{ width: '20%' }}>
        <FungibleTokenImage
          fungibleToken={{ ...props.stat.fungibleToken, amount: BigInt(0) }}
        />
      </FlexDiv>

      <CenteredDivHorizontal style={{ width: '20%' }}>
        <Strong>{props.stat.fungibleToken.name}</Strong>
      </CenteredDivHorizontal>

      <CenteredDivHorizontal style={{ width: '40%' }}>
        <FlexDiv>
          <A
            href={`${config.explorerFrontendUrl}/en/token/${props.stat.fungibleToken.tokenId}`}
            target="_blank"
          >
            <ExternalLink color={theme.properties.colorPrimary} />
          </A>
        </FlexDiv>
        <Spacer size={spacing.spacing_xxs} vertical={false} />
        <FlexDiv>
          <Text>{shortenString(props.stat.fungibleToken.tokenId, 24)}</Text>
        </FlexDiv>
      </CenteredDivHorizontal>

      <CenteredDivHorizontal style={{ width: '20%' }}>
        <VolumeDeltasDisplay
          amountBought={props.stat.stats.amountBought}
          amountSold={props.stat.stats.amountSold}
          decimals={props.stat.fungibleToken.decimals}
        />
      </CenteredDivHorizontal>
    </FlexDiv>
  );
};

const FungibleVolumeTable = (props: {
  stats: FungibleStats[];
}): JSX.Element => {
  if (props.stats.length === 0) {
    return (
      <FlexDiv style={{ width: '100%' }}>
        <Text>No fungible tokens traded yet...</Text>
      </FlexDiv>
    );
  }

  return (
    <FlexDiv style={{ width: '100%' }}>
      {props.stats.map((stat) => {
        return (
          <FungibleVolumeTableEntry
            stat={stat}
            key={stat.fungibleToken.tokenId}
          />
        );
      })}
    </FlexDiv>
  );
};

const NftVolumeTableEntry = (props: { stat: NftStats }): JSX.Element => {
  const theme = useTheme();

  const nft: Nft = {
    name: props.stat.nft.name,
    tokenId: props.stat.nft.tokenId,
  };

  return (
    <FlexDiv
      style={{
        width: '100%',
        border: `1px solid ${theme.properties.colorNavs}`,
      }}
    >
      <FlexDiv style={{ width: '30%' }}>
        <NftDisplay
          nft={nft}
          key={nft.tokenId}
          isSelected={false}
          onClick={() => {}}
          captionColor={theme.properties.colorBgText}
        />
      </FlexDiv>

      <CenteredDivHorizontal style={{ width: '40%' }}>
        <FlexDiv>
          <A
            href={`${config.explorerFrontendUrl}/en/token/${props.stat.nft.tokenId}`}
            target="_blank"
          >
            <ExternalLink color={theme.properties.colorPrimary} />
          </A>
        </FlexDiv>
        <Spacer size={spacing.spacing_xxs} vertical={false} />
        <FlexDiv>
          <Text>{shortenString(props.stat.nft.tokenId, 24)}</Text>
        </FlexDiv>
      </CenteredDivHorizontal>

      <CenteredDivHorizontal style={{ width: '30%' }}>
        <VolumeDeltasDisplay
          amountBought={props.stat.stats.amountBought}
          amountSold={props.stat.stats.amountSold}
          decimals={0}
        />
      </CenteredDivHorizontal>
    </FlexDiv>
  );
};

const NftVolumeTable = (props: { stats: NftStats[] }): JSX.Element => {
  if (props.stats.length === 0) {
    return (
      <FlexDiv style={{ width: '100%' }}>
        <Text>No NFTs traded yet...</Text>
      </FlexDiv>
    );
  }

  return (
    <FlexDiv style={{ width: '100%' }}>
      {props.stats.map((stat) => {
        return <NftVolumeTableEntry stat={stat} key={stat.nft.tokenId} />;
      })}
    </FlexDiv>
  );
};

export const Statistics = (props: {
  userAddr: string;
  nftStats: NftStats[];
  fungibleStats: FungibleStats[];
}): JSX.Element => {
  const theme = useTheme();

  const [showFungible, setShowFungible] = React.useState<boolean>(true);

  return (
    <FlexDiv style={{ width: '100%' }}>
      <FlexDiv style={{ width: '100%' }}>
        <Heading2>
          <span style={{ color: theme.properties.colorPrimary }}>
            {showFungible ? 'Fungible token' : 'NFT'}
          </span>{' '}
          volume
        </Heading2>
        <FlexDiv style={{ marginLeft: 'auto' }}>
          <Toggle
            leftOption="Fungible"
            rightOption="NFT"
            selected={showFungible ? 'left' : 'right'}
            onToggle={(toggledToSide: 'left' | 'right') => {
              setShowFungible(toggledToSide === 'left');
            }}
          />
        </FlexDiv>
      </FlexDiv>
      <FlexDiv style={{ width: '100%' }}>
        {showFungible ? (
          <FungibleVolumeTable stats={props.fungibleStats} />
        ) : (
          <NftVolumeTable stats={props.nftStats} />
        )}
      </FlexDiv>
    </FlexDiv>
  );
};
