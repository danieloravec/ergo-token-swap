import {
  type Box,
  type SignedTransaction,
  type UnsignedTransaction,
  type TransactionId,
  type SignedInput,
} from '@fleet-sdk/common/src/types';

interface Paginate {
  page: number;
  limit: number;
}

type Value = bigint;

type Address = string;

export declare interface WalletApi {
  get_utxos: (
    amount: Value = undefined,
    token_id: string = 'ERG',
    paginate: Paginate = 'undefined'
  ) => Promise<Box[] | undefined>;
  get_balance: (token_id: string = 'ERG') => Promise<Value>;
  get_used_addresses: (paginate: Paginate = 'undefined') => Promise<Address[]>;
  get_unused_addresses: () => Promise<Address[]>;
  get_change_address: () => Promise<Address>;
  get_current_height: () => Promise<number>;
  sign_tx: (tx: UnsignedTransaction) => Promise<SignedTransaction>;
  sign_tx_input: (
    tx: UnsignedTransaction,
    index: number
  ) => Promise<SignedInput>;
  // Not a part of EIP-0012 yet, might not be available in all wallets
  sign_tx_inputs: (
    tx: UnsignedTransaction,
    indices: number[]
  ) => Promise<SignedInput[]>;
  sign_data: (addr: Address, message: string) => Promise<string>;
  submit_tx: (tx: SignedTransaction) => Promise<TransactionId>;
}

export declare global {
  interface Window {
    ergoConnector: any;
    ergo: WalletApi;
  }
}

export type Ergo = Record<
  string,
  {
    name: string;
    icon: string;
    version: string;
    connect: () => Promise<boolean>;
    isConnected: () => Promise<boolean>;
  }
>;
