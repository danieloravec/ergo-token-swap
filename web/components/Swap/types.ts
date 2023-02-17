export interface Nft {
  imageUrl: string;
  name: string;
  tokenId: string;
}

export interface FungibleToken {
  imageUrl: string;
  name: string;
  tokenId: string;
  amount: number;
  decimals: number;
}

export interface ParticipantInfo {
  address: string;
  nfts: Nft[];
  fungibleTokens: FungibleToken[];
  nanoErg: bigint;
}
