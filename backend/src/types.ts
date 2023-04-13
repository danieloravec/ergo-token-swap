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
        hostAddr: 'string',
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
        signedInputsHost: 'object',
        inputIndicesHost: 'object',
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

export const UserCreateBodySchema: Schema = {
    fields: {
        address: 'string',
        username: 'string',
        email: 'string',
        discord: 'string',
        twitter: 'string',
        allowMessages: 'boolean',
        signature: 'string',
    }
}

export const MessageCreateBodySchema: Schema = {
    fields: {
        fromAddress: 'string',
        toAddress: 'string',
        text: 'string',
    }
}
