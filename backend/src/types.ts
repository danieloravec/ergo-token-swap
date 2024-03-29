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
        nftsForA: 'object',
        nftsForB: 'object',
        fungibleTokensForA: 'object',
        fungibleTokensForB: 'object',
        nanoErgForA: 'bigint',
        nanoErgForB: 'bigint',
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
        subject: 'string',
        text: 'string',
    }
}

export const MessageDeleteBodySchema: Schema = {
    fields: {
        id: 'number',
    }
}

export const FollowBodySchema: Schema = {
    fields: {
        fromAddress: 'string',
        toAddress: 'string',
    }
}

export const CollectionCreateBodySchema: Schema = {
    fields: {
        adminAuthSecret: 'string',
        name: 'string',
        description: 'string',
        mintingAddresses: 'object',
    }
}
