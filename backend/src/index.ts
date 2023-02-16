import express from 'express';
import {randomBytes} from 'crypto';
import {config} from '@config';
import Session from '@db/models/session';
import * as utils from '@utils';
import * as types from '@types';
import cors from 'cors';
import {ErgoAddress} from "@fleet-sdk/core";
import {EIP12UnsignedTransaction, SignedInput} from "@fleet-sdk/common";

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
    const {status: updateStatus, message: updateMessage} = await utils.updateSession(body.secret, {
        guestAddr: body.guestAddr,
        guestAssetsJson: assets,
        guestNanoErg: nanoErg
    });
    if(updateStatus !== 200) {
        res.status(updateStatus);
        res.send(updateMessage);
        return;
    }
    res.status(200);
    res.send({});
});

app.get('/session/info', async (req, res) => {
    try {
        const {status, result} = await utils.getSessionByQuery(req);
        if(status !== 200) {
            res.status(status);
            res.send(result);
        }
        const session = result as Session;
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

app.post('/tx/partial/register', async (req, res) => {
    try {
        const bodyIsValid = await utils.validateObject(req.body, types.TxPartialRegisterBodySchema);
        if(!bodyIsValid) {
            res.status(400);
            res.send('Invalid body');
            return;
        }
        const body: {secret: string, unsignedTx: EIP12UnsignedTransaction, signedInputsCreator: SignedInput[], inputIndicesCreator: number[], inputIndicesGuest: number[]} = req.body;
        const {status: updateStatus, message: updateMessage} = await utils.updateSession(body.secret, {
            unsignedTx: body.unsignedTx,
            unsignedTxAddedOn: new Date(),
            signedInputsCreator: body.signedInputsCreator,
            txInputIndicesCreator: body.inputIndicesCreator,
            txInputIndicesGuest: body.inputIndicesGuest,
        });
        if(updateStatus !== 200) {
            res.status(updateStatus);
            res.send(updateMessage);
            return;
        }
        res.status(200);
        res.send({});
    } catch(err) {
        res.status(500);
        res.send("Server-side error while registering the transaction");
    }
});

// Returns the unsigned transaction and the input indices of the guest who needs to finalize the signing process
// Returns empty body if the partial transaction is not registered yet
app.get('/tx/partial', async (req, res) => {
    try {
        const {status, result} = await utils.getSessionByQuery(req);
        if(status !== 200) {
            res.status(status);
            res.send(result);
        }
        const session = result as Session;
        res.status(200);
        if(session.unsignedTx === null) {
            res.send({});
            return;
        }
        res.send({
            unsignedTx: session.unsignedTx,
            inputIndicesGuest: session.txInputIndicesGuest,
        })
    } catch (err) {
        res.status(500);
        res.send("Server-side error while getting info about the partial transaction");
    }
});

app.listen(config.backendPort, () => {
    console.log(`server running on port ${config.backendPort}`);
});