export interface Nft {
  name: string;
  tokenId: string;
}

export interface FungibleToken {
  name: string;
  tokenId: string;
  amount: bigint;
  decimals: number;
}

export interface ParticipantInfo {
  address: string;
  nfts: Nft[];
  fungibleTokens: FungibleToken[];
  nanoErg: bigint;
}
