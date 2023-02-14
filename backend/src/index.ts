import express from 'express';
import {randomBytes} from 'crypto';
import {config} from '@config';
import Session from '@db/models/session';
import * as utils from '@utils';
import * as types from '@types';
import {ErgoAddress} from '@fleet-sdk/core';
import sequelizeConnection from "@db/config";
import cors from 'cors';
import {FungibleToken, Nft} from "@types";

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send("Ergo token swap API /");
});

app.post('/session/create', async (req, res) => {
    const bodyIsValid = await utils.validateObject(req.body, types.SessionCreateBodySchema);
    if(!bodyIsValid) {
        res.status(400);
        res.send('Invalid body');
        return;
    }
    const body: {creatorAddr: string} = req.body;
    if (!ErgoAddress.validate(body!.creatorAddr)) {
        res.status(400);
        res.send("Invalid creatorAddress");
        return;
    }
    const secret = randomBytes(16).toString('hex');
    const { assets, nanoErg } = await utils.getAssetsAndNanoErgByAddress(body!.creatorAddr);
    try {
        await Session.create({
            secret,
            creatorAddr: body!.creatorAddr,
            creatorAssetsJson: assets,
            creatorNanoErg: nanoErg,
        });
    } catch (e) {
        console.error(e.message);
        res.status(500);
        res.send("Error while creating session");
        return;
    }
    res.status(200);
    res.send({secret});
});

app.post('/session/enter', async (req, res) => {
    const bodyIsValid = await utils.validateObject(req.body, types.SessionEnterBodySchema);
    if(!bodyIsValid) {
        res.status(400);
        res.send('Invalid body');
        return;
    }
    const body: {secret: string, guestAddr: string} = req.body;
    if(!ErgoAddress.validate(body!.guestAddr)) {
        res.status(400);
        res.send("Invalid guestAddr");
        return;
    }
    const { assets, nanoErg } = await utils.getAssetsAndNanoErgByAddress(body!.guestAddr);
    const sessionNotFoundMsg = "Session not found";
    try {
        await sequelizeConnection.transaction(async (t) => {
            const session = await Session.findOne({
                where: {
                    secret: body.secret
                },
                transaction: t,
            });
            if(!session) {
                throw new Error(sessionNotFoundMsg);
            }
            if(session.submittedAt) {
                throw new Error("Session already settled");
            }
            await Session.update({
                guestAddr: body.guestAddr,
                guestAssetsJson: assets,
                guestNanoErg: nanoErg
            }, {
                where: {
                    secret: body.secret
                }
            });
        });
    } catch (e) {
        if(e.message === sessionNotFoundMsg) {
            res.status(404);
            res.send(e.message);
        } else {
            res.status(500);
            res.send("Error while entering session");
        }
        return;
    }
    res.status(200);
    res.send({});
});

app.get('/session/info', async (req, res) => {
    try {
        if (req.query.secret === undefined) {
            res.status(400);
            res.send("Missing secret");
            return;
        }
        const secret = req.query.secret as string;
        const session = await Session.findOne({
            where: {
                secret
            }
        });
        if (!session) {
            res.status(400);
            res.send("Unknown session");
            return;
        }
        const {nfts: creatorNfts, fungibleTokens: creatorFungibleTokens} = utils.splitAssets(session.creatorAssetsJson);
        const {nfts: guestNfts, fungibleTokens: guestFungibleTokens} = utils.splitAssets(session.guestAssetsJson);
        res.status(200);
        res.send({
            creator: {
                address: session.creatorAddr,
                nfts: creatorNfts,
                fungibleTokens: creatorFungibleTokens,
                nanoErg: session.creatorNanoErg,
            },
            guest: session.guestAddr === null ? undefined : {
                address: session.guestAddr,
                nfts: guestNfts,
                fungibleTokens: guestFungibleTokens,
                nanoErg: session.guestNanoErg ?? undefined,
            },
        });
    } catch (err) {
        res.status(500);
        res.send("Server-side error while getting info");
    }
});

app.listen(config.backendPort, () => {
    console.log(`server running on port ${config.backendPort}`);
});