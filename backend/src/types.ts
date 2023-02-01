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