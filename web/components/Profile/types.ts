import { type Nft } from '@components/Swap/types';

export interface Swap {
  timestamp: string;
  host_addr: string;
  guest_addr: string;
  tx_id: string;
}

export interface Stats {
  amountBought: bigint;
  amountSold: bigint;
}

export interface NftStats {
  nft: Nft & { imageUrl?: string };
  stats: Stats;
}

export interface FungibleStats {
  fungibleToken: {
    tokenId: string;
    name: string;
    decimals: number;
  };
  stats: Stats;
}
