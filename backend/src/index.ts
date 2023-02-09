import express from 'express';
import {randomBytes} from 'crypto';
import {config} from '@config';
import Session from '@db/models/session';
import * as utils from '@utils';
import * as types from '@types';
import {ErgoAddress} from '@fleet-sdk/core';
import sequelizeConnection from "@db/config";

const app = express();
app.use(express.json());

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
    try {
        await Session.create({secret, creatorAddr: body!.creatorAddr});
    } catch (e) {
        res.status(500);
        res.send("Error while creating session");
        return;
    }
    const { assets, nanoErg } = await utils.getAssetsAndNanoErgByAddress(body!.creatorAddr);
    res.status(200);
    res.send({secret, assets, nanoErg: String(nanoErg)});
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
            await Session.update({ guestAddr: body.guestAddr }, {
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
    const { assets, nanoErg } = await utils.getAssetsAndNanoErgByAddress(body!.guestAddr);
    res.status(200);
    res.send({assets, nanoErg: String(nanoErg)});
});

app.get('/session/whoami', async (req, res) => {
    if(req.query.secret === undefined || req.query.address === undefined) {
        res.status(400);
        res.send("Missing secret or address");
        return;
    }
    const secret = req.query.secret as string;
    const address = req.query.address as string;
    if(!ErgoAddress.validate(address)) {
        res.status(400);
        res.send("Invalid address provided");
        return;
    }
    const session = await Session.findOne({
        where: {
            secret
        }
    });
    let whoami = "nobody";
    if(session) {
        if(session.creatorAddr === address) {
            whoami = "creator";
        } else if(session.guestAddr === address) {
            whoami = "guest";
        }
    }
    res.status(200);
    res.send({whoami});
});

app.listen(config.backendPort, () => {
    console.log(`server running on port ${config.backendPort}`);
});