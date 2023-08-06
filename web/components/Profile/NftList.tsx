import { Text } from '@components/Common/Text';
import { type Nft } from '@components/Swap/types';
import { FlexDiv } from '@components/Common/Alignment';
import styled, { useTheme } from 'styled-components';
import { spacing } from '@themes/spacing';
import { NftDisplay } from '@components/Tokens/NftDisplay';

const NftDisplaySlot = styled(FlexDiv)`
  margin-right: ${`${spacing.spacing_s}px`};
`;

export const NftList = (props: {
  rawNfts: Nft[] | undefined;
  captionColor?: string;
}): JSX.Element => {
  const theme = useTheme();

  if (props.rawNfts === undefined) {
    return <Text>Loading NFTs...</Text>;
  }
  if (props.rawNfts.length === 0) {
    return <Text>No NFTs found</Text>;
  }

  return (
    <FlexDiv>
      {props.rawNfts.map((nft, index) => {
        return (
          <NftDisplaySlot key={nft.tokenId}>
            <NftDisplay
              nft={nft}
              key={nft.tokenId}
              imgSize={180}
              isSelected={false}
              onClick={(e) => {}}
              captionColor={
                props.captionColor !== undefined
                  ? props.captionColor
                  : theme.properties.colorBgText
              }
            />
          </NftDisplaySlot>
        );
      })}
    </FlexDiv>
  );
};
