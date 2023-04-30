import { A, StrongBg, Text } from '@components/Common/Text';
import { type FungibleToken } from '@components/Swap/types';
import { CenteredDivHorizontal, FlexDiv } from '@components/Common/Alignment';
import { FungibleTokenImage } from '@components/Swap/TokenSelection';
import { config } from '@config';
import { ExternalLink } from '@components/Icons/ExternalLink';
import { useTheme } from 'styled-components';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { decimalize, shortenString } from '@utils/formatters';

const FungibleTokenTableEntry = (props: {
  fungibleToken: FungibleToken;
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
        <FungibleTokenImage fungibleToken={props.fungibleToken} />
      </FlexDiv>

      <CenteredDivHorizontal style={{ width: '20%' }}>
        <StrongBg>{props.fungibleToken.name}</StrongBg>
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
          <Text>{shortenString(props.fungibleToken.tokenId, 24)}</Text>
        </FlexDiv>
      </CenteredDivHorizontal>

      <CenteredDivHorizontal style={{ width: '20%' }}>
        <StrongBg>
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
}): JSX.Element => {
  if (props.rawFungibles === undefined) {
    return <Text>Error while loading fungible tokens...</Text>;
  }
  if (props.rawFungibles.length === 0) {
    return <Text>No fungible tokens found</Text>;
  }
  return (
    <FlexDiv>
      {props.rawFungibles.map((fungible, index) => {
        return (
          <FungibleTokenTableEntry
            fungibleToken={fungible}
            key={fungible.tokenId}
          />
        );
      })}
    </FlexDiv>
  );
};
