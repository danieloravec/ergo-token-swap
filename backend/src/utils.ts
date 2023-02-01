import {config} from "@config";

export async function explorerRequest(endpoint: string): Promise<any> {
    const res = await fetch(`${config.blockchainApiUrl}${endpoint}`);
    return await res.json();
}

type Asset = {
    tokenId: string;
    index: number;
    amount: number;
    name: string;
    decimals: number;
    type: string;
}
export async function getAssetsAndNanoErgByAddress(address: string): Promise<{assets: Asset[], nanoErg: bigint}> {
    const boxesResponse = await explorerRequest(`/transactions/boxes/byAddress/unspent/${address}`);
    const assets: Asset[] = [];
    let nanoErg = BigInt(0);
    for (const box of boxesResponse) {
        assets.push(...box.assets);
        nanoErg += BigInt(box.value);
    }
    return { assets, nanoErg };
}

export type Schema = {
    fields: { [key: string]: string }
}

export const SessionCreateBodySchema: Schema = {
    fields: {
        creatorAddr: 'string',
    },
}

export const validateObject = async (obj: any, model: Schema) => {
    for (const key of Object.keys(obj)) {
        if (model.fields[key] === undefined) {
            return false;
        }
        else if (typeof obj[key] !== model.fields[key]) {
            return false;
        }
    }
    return true;
}