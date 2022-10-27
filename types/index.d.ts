type Paginate = {
    page: number,
    limit: number,
};

type Value = BigInt;

type Constant = string;

type TxId = string;

type ErgoTree = string;

type TokenId = string;

type TokenAmount = {
    tokenId: TokenId,
    amount: Value,
};

type BoxId = string;

type Address = string;

type ContextExtension = {} | {
    values: { [string]: string }
};

type ProverResult = {
    proofBytes: string,
    extension: ContextExtension,
};

type SignedInput = {
    boxId: BoxId,
    spendingProof: ProverResult,
};

type UnsignedInput = {
    extension: ContextExtension,
    boxId: BoxId,
    value: Value,
    ergoTree: ErgoTree,
    assets: TokenAmount[],
    additionalRegisters: { [string]: Constant },
    creationHeight: number,
    transactionId: TxId,
    index: number,
};

type DataInput = {
    boxId: BoxId,
};

type BoxCandidate = {
    value: Value,
    ergoTree: ErgoTree,
    assets: TokenAmount[],
    additionalRegisters: { [string]: Constant },
    creationHeight: number,
  };

type Tx = {
    inputs: UnsignedInput[],
    dataInputs: DataInput[],
    outputs: BoxCandidate[],
};

type SignedTx = {
    id: TxId,
    inputs: SignedInput[],
    dataInputs: DataInput[],
    outputs: Box[],
    size: number,
};

type Box = {
    boxId: BoxId,
    value: Value,
    ergoTree: ErgoTree,
    assets: TokenAmount[],
    additionalRegisters: { [string]: Constant },
    creationHeight: number,
    transactionId: TxId,
    index: number,
};

export declare type WalletApi = {
    get_utxos(amount: Value = undefined, token_id: string = 'ERG', paginate: Paginate = 'undefined'): Promise<Box[] | undefined>;
    get_balance(token_id: string = 'ERG'): Promise<Value>;
    get_used_addresses(paginate: Paginate = 'undefined'): Promise<Address[]>;
    get_unused_addresses(): Promise<Address[]>;
    get_change_address(): Promise<Address>;
    sign_tx(tx: Tx): Promise<SignedTx>;
    sign_tx_input(tx: Tx, index: number): Promise<SignedInput>;
    sign_data(addr: Address, message: string): Promise<string>;
    submit_tx(tx: SignedTx): Promise<TxId>;
};

export declare global {
  interface Window {
    ergoConnector: any;
    ergo: WalletApi;
  }
}

export declare type Ergo = {
    [key: string]: {
        name: string;
        icon: string;
        version: string;
        connect(): Promise<boolean>;
        isConnected(): Promise<boolean>;
    };
};
