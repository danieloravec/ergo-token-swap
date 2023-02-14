import {config} from "@config";
import {Asset, Schema, Nft, FungibleToken} from "@types";

export async function explorerRequest(endpoint: string): Promise<any> {
    const res = await fetch(`${config.blockchainApiUrl}${endpoint}`);
    return await res.json();
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

// TODO make differentiating between NFTs and fungible tokens according to standard
export const splitAssets = (assets: Asset[] | undefined | null): {nfts: Nft[], fungibleTokens: FungibleToken[]} | undefined => {
    if(!assets) {
        return {
            nfts: undefined,
            fungibleTokens: undefined,
        };
    }
    const rawNfts = assets.filter((asset: Asset) => {return asset.amount === 1;});
    const rawFungibleTokens = assets.filter((asset: Asset) => {return asset.amount !==1;});
    const nfts = rawNfts.map((asset: Asset) => {
        return {
            imageUrl: "unknown",
            name: asset.name,
            tokenId: asset.tokenId,
        };
    });
    const fungibleTokens = rawFungibleTokens.map((asset: Asset) => {
        return {
            imageUrl: "unknown",
            name: asset.name,
            tokenId: asset.tokenId,
            amount: asset.amount,
            decimals: asset.decimals,
        }
    });
    return { nfts, fungibleTokens };
}