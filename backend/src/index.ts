import express from 'express';
import {randomBytes} from 'crypto';
import {config} from '@config';
import Session from '@db/models/session';
import * as utils from '@utils';
import {ErgoAddress} from '@fleet-sdk/core';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Ergo token swap API /");
});

app.post('/session/create', async (req, res) => {
    const bodyIsValid = await utils.validateObject(req.body, utils.SessionCreateBodySchema);
    if(!bodyIsValid) {
        res.status(400);
        res.send('Invalid body');
    }
    const body: {creatorAddr: string} = req.body;
    if (!ErgoAddress.validate(body!.creatorAddr)) {
        res.status(400);
        res.send("Invalid creatorAddress");
    }
    const secret = randomBytes(16).toString('hex');
    try {
        await Session.create({secret, creatorAddr: body!.creatorAddr});
    } catch (e) {
        res.status(500);
        res.send("Error while creating session");
    }
    const { assets, nanoErg } = await utils.getAssetsAndNanoErgByAddress(body!.creatorAddr);
    res.status(200);
    res.send({secret, assets, nanoErg: String(nanoErg)});
});

app.listen(config.backendPort, () => {
    console.log(`server running on port ${config.backendPort}`);
});