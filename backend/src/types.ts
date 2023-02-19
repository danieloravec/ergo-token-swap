export type Asset = {
    tokenId: string;
    index: number;
    amount: number;
    name: string;
    decimals: number;
    type: string;
};

export type Schema = {
    fields: { [key: string]: string }
};

export const SessionCreateBodySchema: Schema = {
    fields: {
        creatorAddr: 'string',
    },
};

export const SessionEnterBodySchema: Schema = {
    fields: {
        secret: 'string',
        guestAddr: 'string',
    },
};

export const TxPartialRegisterBodySchema: Schema = {
    fields: {
        secret: 'string',
        unsignedTx: 'object',
        signedInputsCreator: 'object',
        inputIndicesCreator: 'object',
        inputIndicesGuest: 'object',
    }
}

export const TxRegisterBodySchema: Schema = {
    fields: {
        secret: 'string',
        txId: 'string',
    }
}

export interface Nft {
    name: string;
    tokenId: string;
}

export interface FungibleToken {
    name: string;
    tokenId: string;
    amount: number;
    decimals: number;
}
