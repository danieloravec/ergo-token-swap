import { type FungibleToken, type Nft } from '@components/Swap/types';
import { Button } from '@components/Common/Button';
import { FlexDiv } from '@components/Common/Alignment';
import { jsonStringifyBig } from '@utils/utils';
import { NftList } from '@components/Profile/NftList';
import { FungibleList } from '@components/Profile/FungibleList';

// TODO add support for ERG and then do a better design of the modal

const NftModalList = (props: { nfts: Nft[] }): JSX.Element => {
  return (
    <FlexDiv>
      <NftList rawNfts={props.nfts} />
    </FlexDiv>
  );
};

const FungibleTokenModalList = (props: {
  fungibleTokens: FungibleToken[];
  nanoErg: bigint;
}): JSX.Element => {
  return (
    <FlexDiv>
      <FungibleList
        rawFungibles={props.fungibleTokens}
        nanoErg={props.nanoErg}
      />
    </FlexDiv>
  );
};

export const ConfirmTxModal = (props: {
  nftsForA: Nft[];
  nftsForB: Nft[];
  fungibleTokensForA: FungibleToken[];
  fungibleTokensForB: FungibleToken[];
  nanoErgForA: bigint;
  nanoErgForB: bigint;
  onAgree: () => void;
}): JSX.Element => {
  console.log(jsonStringifyBig(props));

  return (
    <FlexDiv>
      <h1>You send:</h1>
      {props.nftsForB.length > 0 && <NftModalList nfts={props.nftsForB} />}
      {(props.fungibleTokensForB.length > 0 || props.nanoErgForB > 0) && (
        <FungibleTokenModalList
          fungibleTokens={props.fungibleTokensForB}
          nanoErg={props.nanoErgForB}
        />
      )}

      <h1>You receive:</h1>
      {props.nftsForA.length > 0 && <NftModalList nfts={props.nftsForA} />}
      {(props.fungibleTokensForA.length > 0 || props.nanoErgForA > 0) && (
        <FungibleTokenModalList
          fungibleTokens={props.fungibleTokensForA}
          nanoErg={props.nanoErgForA}
        />
      )}

      <Button onClick={props.onAgree}>Swap</Button>
    </FlexDiv>
  );
};
