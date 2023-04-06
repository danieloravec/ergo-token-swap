import { Text } from '@components/Common/Text';
import { type Nft } from '@components/Swap/types';
import { NftDisplay } from '@components/Swap/TokenSelection';
import { FlexDiv } from '@components/Common/Alignment';
import styled from 'styled-components';
import { spacing } from '@themes/spacing';

const NftDisplaySlot = styled(FlexDiv)`
  margin-right: ${`${spacing.spacing_s}px`};
`;

export const NftList = (props: {
  targetAddress: string;
  rawNfts: Nft[] | undefined;
}): JSX.Element => {
  if (props.rawNfts === undefined) {
    return <Text>Error while loading NFTs...</Text>;
  }
  if (props.rawNfts.length === 0) {
    return <Text>No NFTs found</Text>;
  }
  return (
    <FlexDiv>
      {props.rawNfts.map((nft, index) => {
        return (
          <NftDisplaySlot>
            <NftDisplay
              nft={nft}
              key={nft.tokenId}
              isSelected={false}
              onClick={(e) => {}}
            />
          </NftDisplaySlot>
        );
      })}
    </FlexDiv>
  );
};
