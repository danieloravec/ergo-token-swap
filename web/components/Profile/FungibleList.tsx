import { A, StrongBg, Text } from '@components/Common/Text';
import { type FungibleToken } from '@components/Swap/types';
import { CenteredDivHorizontal, FlexDiv } from '@components/Common/Alignment';
import { config } from '@config';
import { ExternalLink } from '@components/Icons/ExternalLink';
import { useTheme } from 'styled-components';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { decimalize, shortenString } from '@utils/formatters';
import { FungibleTokenImage } from '@components/Tokens/FungibleTokenDisplay';
import { assetIconMap } from '@mappers/assetIconMap';
import { useEffect } from 'react';

const FungibleTokenTableEntry = (props: {
  fungibleToken: FungibleToken;
  onIsUnverified?: () => void;
  onIsVerified?: () => void;
  captionColor?: string;
}): JSX.Element => {
  const theme = useTheme();

  const isVerified = assetIconMap[props.fungibleToken.tokenId] !== undefined;
  const name = `${isVerified ? '✅' : '🚨'} ${props.fungibleToken.name}`;
  const captionColorStyle =
    props.captionColor !== undefined ? { color: props.captionColor } : {};

  useEffect(() => {
    if (isVerified && props.onIsVerified !== undefined) {
      props.onIsVerified();
    }
    if (!isVerified && props.onIsUnverified !== undefined) {
      props.onIsUnverified();
    }
  }, []);

  return (
    <FlexDiv
      style={{
        width: '100%',
        border: `1px solid ${theme.properties.colorNavs}`,
      }}
    >
      <FlexDiv style={{ width: '20%' }}>
        <FungibleTokenImage fungibleToken={props.fungibleToken} />
      </FlexDiv>

      <CenteredDivHorizontal style={{ width: '20%' }}>
        {props.captionColor === undefined ? (
          <StrongBg>{name}</StrongBg>
        ) : (
          <strong style={captionColorStyle}>{name}</strong>
        )}
      </CenteredDivHorizontal>

      <CenteredDivHorizontal style={{ width: '40%' }}>
        <FlexDiv>
          <A
            href={`${config.explorerFrontendUrl}/en/token/${props.fungibleToken.tokenId}`}
            target="_blank"
          >
            <ExternalLink color={theme.properties.colorPrimary} />
          </A>
        </FlexDiv>
        <Spacer size={spacing.spacing_xxs} vertical={false} />
        <FlexDiv>
          <Text style={captionColorStyle}>
            {shortenString(props.fungibleToken.tokenId, 16)}
          </Text>
        </FlexDiv>
      </CenteredDivHorizontal>

      <CenteredDivHorizontal style={{ width: '20%' }}>
        <StrongBg style={captionColorStyle}>
          {String(
            decimalize(props.fungibleToken.amount, props.fungibleToken.decimals)
          )}
        </StrongBg>
      </CenteredDivHorizontal>
    </FlexDiv>
  );
};

export const FungibleList = (props: {
  rawFungibles: FungibleToken[] | undefined;
  nanoErg: bigint;
  onContainsUnverified?: () => void;
  onContainsVerified?: () => void;
  captionColor?: string;
}): JSX.Element => {
  if (props.rawFungibles === undefined) {
    return <Text>Error while loading fungible tokens...</Text>;
  }
  if (props.rawFungibles.length === 0 && props.nanoErg === BigInt(0)) {
    return <Text>No fungible tokens found</Text>;
  }
  return (
    <FlexDiv style={{ width: '100%' }}>
      {props.nanoErg > BigInt(0) && (
        <FungibleTokenTableEntry
          fungibleToken={{
            name: 'Ergo',
            tokenId: config.ergTokenId,
            amount: props.nanoErg,
            decimals: 9,
          }}
          key={config.ergTokenId}
          onIsVerified={props.onContainsVerified}
          onIsUnverified={props.onContainsUnverified}
          captionColor={props.captionColor}
        />
      )}
      {props.rawFungibles.map((fungible, index) => {
        return (
          <FungibleTokenTableEntry
            fungibleToken={fungible}
            key={fungible.tokenId}
            captionColor={props.captionColor}
            onIsVerified={props.onContainsVerified}
            onIsUnverified={props.onContainsUnverified}
          />
        );
      })}
    </FlexDiv>
  );
};
