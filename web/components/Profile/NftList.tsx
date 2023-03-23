import { Text } from '@components/Common/Text';
import { type Nft } from '@components/Swap/types';

export const NftList = (props: {
  targetAddress: string;
  rawNfts: Nft[] | undefined;
}): JSX.Element => {
  if (props.rawNfts === undefined) {
    return <Text>Error while loading NFTs...</Text>;
  }
  // TODO load images from props.rawNfts, such as in TokenSelection.tsx (extract some code from that into a function and reuse it here) and display them
  return <Text>NFTs will be listed here</Text>;
};
