import {config} from "@config";
import {Asset, Schema, Nft, FungibleToken} from "@types";
import sequelizeConnection from "@db/config";
import TradingSession from "@db/models/trading_session";
import {Request} from "express";
import fetch from "cross-fetch";

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
            name: asset.name,
            tokenId: asset.tokenId,
        };
    });
    const fungibleTokens = rawFungibleTokens.map((asset: Asset) => {
        return {
            name: asset.name,
            tokenId: asset.tokenId,
            amount: asset.amount,
            decimals: asset.decimals,
        }
    });
    return { nfts, fungibleTokens };
}

export const updateSession = async (secret: string, updatedData: object): Promise<{status: number, message: string}> => {
    const sessionNotFoundMsg = "Session not found";
    try {
        await sequelizeConnection.transaction(async (t) => {
            const session = await TradingSession.findOne({
                where: {
                    secret
                },
                transaction: t,
            });
            if(!session) {
                throw new Error(sessionNotFoundMsg);
            }
            if(session.submittedAt) {
                throw new Error("Session already settled");
            }
            await TradingSession.update(updatedData, {
                where: {
                    secret
                }
            });
        });
    } catch (e) {
        if(e.message === sessionNotFoundMsg) {
            return {
                status: 404,
                message: e.message,
            }
        } else {
            return {
                status: 500,
                message: "Error while entering session",
            }
        }
    }
    return {
        status: 200,
        message: "OK",
    }
}

export const getSessionByQuery = async (req: Request): Promise<{status: number, result: string | TradingSession}> => {
    if (req.query.secret === undefined) {
        return {
            status: 400,
            result: "Missing secret",
        };
    }
    const secret = req.query.secret as string;
    const session = await TradingSession.findOne({
        where: {
            secret
        }
    });
    if (!session) {
        return {
            status: 400,
            result: "Unknown session",
        }
    }
    return {
        status: 200,
        result: session,
    }
}