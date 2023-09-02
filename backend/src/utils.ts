import {config} from "@config";
import {Asset, Schema, Nft, FungibleToken} from "@types";
import sequelizeConnection from "@db/config";
import TradingSession from "@db/models/trading_session";
import {Request, Response} from "express";
import fetch from "cross-fetch";
import * as jwt from "jsonwebtoken";
import {JwtPayload} from "jsonwebtoken";
import {ErgoAddress, TokenAmount} from "@fleet-sdk/core";
import {EIP12UnsignedTransaction} from "@fleet-sdk/common";
import UserAssetStats from "@db/models/user_asset_stats";
import User from "@db/models/user";
import {Transaction} from "sequelize";
import * as types from "@types";
import JSONBig from "json-bigint";
import { explorerRequest } from "@ergo/utils";

export async function getAssetsAndNanoErgByAddress(address: string): Promise<{assets: Asset[], nanoErg: bigint}> {
    const boxesResponse = await explorerRequest(`/transactions/boxes/byAddress/unspent/${address}`, 0);
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
            if(session.submitted_at) {
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

const calcAddressDelta = (unsignedTx: EIP12UnsignedTransaction, inputIndices: number[]) => {
    if (inputIndices.length === 0) {
        throw new Error("NO_INPUTS_FROM_ADDRESS");
    }
    const ergoTree = unsignedTx.inputs.filter((x, i) => i === inputIndices[0])[0].ergoTree;

    const ourInputAssets = unsignedTx.inputs.filter((x, i) => {
        return inputIndices.includes(i)
    }).map((x) => x.assets).flat();

    const ourOutputAssets = unsignedTx.outputs.filter((x) => {
        return x.ergoTree === ergoTree
    }).map((x) => x.assets).flat();

    const bought = assetDifference(assetSum(ourOutputAssets), assetSum(ourInputAssets));
    const sold = assetDifference(assetSum(ourInputAssets), assetSum(ourOutputAssets));

    const delta: {[tokenId: string]: {bought: bigint, sold: bigint}} = {};
    for (const b of bought) {
        if (delta[b.tokenId] === undefined) {
            delta[b.tokenId] = {
                bought: BigInt(0),
                sold: BigInt(0),
            }
        }
        delta[b.tokenId].bought += BigInt(b.amount);
    }
    for (const s of sold) {
        if (delta[s.tokenId] === undefined) {
            delta[s.tokenId] = {
                bought: BigInt(0),
                sold: BigInt(0),
            }
        }
        delta[s.tokenId].sold += BigInt(s.amount);
    }

    return delta;
}

const updateStatsForAddress = async (userAddress: string, deltas: {[tokenId: string]: {bought: bigint, sold: bigint}}) => {
    const t = await sequelizeConnection.transaction();
    try {
        for (const [tokenId, delta] of Object.entries(deltas)) {
            let stat = await UserAssetStats.findOne({
                where: {
                    user_address: userAddress,
                    token_id: tokenId,
                },
                transaction: t,
                raw: true,
            });
            if (!stat) {
                stat = await UserAssetStats.create({
                    token_id: tokenId,
                    user_address: userAddress,
                    amount_bought: BigInt(0),
                    amount_sold: BigInt(0),
                })
            }
            await UserAssetStats.update({
                amount_bought: BigInt(stat.amount_bought) + delta.bought,
                amount_sold: BigInt(stat.amount_sold) + delta.sold,
            }, {
                where: {
                    user_address: userAddress,
                    token_id: tokenId,
                },
                transaction: t,
            });
        }
        await t.commit();
    }  catch (err) {
        console.error(
          `Error updating stat for userAddress ${userAddress}: ${err}`
        )
        await t.rollback();
        return false;
    }
    return true;
}

// TODO move tx submission to backend as this can be faked right now
export const updateStats = async (secret: string): Promise<boolean> => {
    try {
        const tradingSession = await TradingSession.findOne({where: {secret}, raw: true});
        if (!tradingSession) {
            return false;
        }
        const unsignedTx = tradingSession.unsigned_tx;

        const hostDelta = calcAddressDelta(unsignedTx, tradingSession.tx_input_indices_host);
        const guestDelta = calcAddressDelta(unsignedTx, tradingSession.tx_input_indices_guest);

        const hostSuccess = await updateStatsForAddress(tradingSession.host_addr, hostDelta);
        if (!hostSuccess) {
            return false;
        }
        return await updateStatsForAddress(tradingSession.guest_addr, guestDelta);
    } catch (err) {
        console.error(`Error updating stats for secret ${secret}: ${err}`);
        return false;
    }
}

export const getSessionByReq = async (req: Request): Promise<{status: number, result: string | TradingSession}> => {
    if (req.query.secret === undefined && req.body?.secret === undefined) {
        return {
            status: 400,
            result: "Missing secret",
        };
    }
    const secret = (req.query.secret ?? req.body?.secret) as string;
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

export const toHex = (str: string): string => {
    return Buffer.from(str).toString('hex');
}

export const verifyJwt = (address: string, jwtStr: string): boolean => {
    try {
        const data = jwt.verify(jwtStr, config.jwtSecret) as JwtPayload;
        return data.address === address && data.timestamp > Date.now() - config.jwtLifespanMs;
    } catch (err) {
        console.error(`Invalid JWT: ${err}`);
        return false;
    }
}

export const verifySignature = (data: string, signature?: string): boolean => {
    if (signature === undefined) {
        return false;
    }
    // const serializedData = toHex(JSON.stringify(data));
    return true; // TODO implement signature verification once dApp connector's sign_data is available
}

export const assetSum = (assetAmounts: TokenAmount<string>[]): TokenAmount<string>[] => {
    const sum: TokenAmount<string>[] = [];
    for (const assetAmount of assetAmounts) {
        const existingAsset = sum.find((x) => x.tokenId === assetAmount.tokenId);
        if (existingAsset) {
            existingAsset.amount = String(BigInt(existingAsset.amount) +  BigInt(assetAmount.amount));
        } else {
            sum.push(assetAmount);
        }
    }

    return sum;
}

// Returns tokens that are in A but not in B
export const assetDifference = (assetAmountsA: TokenAmount<string>[], assetAmountsB: TokenAmount<string>[]): TokenAmount<string>[] => {

    const difference: {[tokenId: string]: bigint} = {};
    for (const assetAmount of assetAmountsA) {
        difference[assetAmount.tokenId] = BigInt(assetAmount.amount);
    }
    for (const assetAmount of assetAmountsB) {
        if (Object.keys(difference).includes(assetAmount.tokenId)) {
            difference[assetAmount.tokenId] -= BigInt(assetAmount.amount);
        }
    }
    const result: TokenAmount<string>[] = [];
    for(const [tokenId, amount] of Object.entries(difference)) {
        if (amount > 0) {
            result.push({
                tokenId,
                amount: String(amount),
            });
        }
    }

    return result;
}

export const ensureAuth = (req: Request, res: Response, address?: string): boolean => {
    if (!address) {
        return false;
    }
    const token = req.header("Authorization");
    if(token === undefined || !verifyJwt(address, token)) {
        res.status(401);
        res.send("Unauthorized");
        return false;
    }
    return true;
}

export const getUserOrSend400 = async (req: Request, res: Response, address: string, transaction?: Transaction): Promise<User> => {
    try {
        const user = await User.findOne({
            where: {address},
            transaction
        })
        if (!user) {
            res.status(400);
            res.send({message: 'User not found'});
        }
        return user;
    } catch (err) {
        console.error(err);
        if (transaction !== undefined) {
            await transaction.rollback();
        }
    }
}

export const ensureAddressValid = (req: Request, res: Response, address?: string): boolean => {
    if (address === undefined || !ErgoAddress.validate(address)) {
        res.status(400);
        res.send({message: 'Invalid address'});
        return false;
    }
    return true;
}

export const ensureFollowBodyValidReturnUser = async (req: Request, res: Response): Promise<User | undefined> => {
    const bodyIsValid = await validateObject(req.body, types.FollowBodySchema);
    if (!bodyIsValid) {
        res.status(400);
        res.send({message: 'Invalid body'});
        return;
    }
    if (!ensureAddressValid(req, res, req.body.fromAddress)) {
        return;
    }
    if (!ensureAddressValid(req, res, req.body.toAddress)) {
        return;
    }
    return await  getUserOrSend400(req, res, req.body.fromAddress);
}