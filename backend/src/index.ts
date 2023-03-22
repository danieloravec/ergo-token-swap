import express from 'express';
import {randomBytes} from 'crypto';
import {config} from '@config';
import TradingSession from '@db/models/trading_session';
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
    try {
        const bodyIsValid = await utils.validateObject(req.body, types.SessionCreateBodySchema);
        if (!bodyIsValid) {
            res.status(400);
            res.send('Invalid body');
            return;
        }
        const body: { hostAddr: string } = req.body;
        if (!ErgoAddress.validate(body!.hostAddr)) {
            res.status(400);
            res.send("Invalid hostAddress");
            return;
        }
        const secret = randomBytes(16).toString('hex');
        const {assets, nanoErg} = await utils.getAssetsAndNanoErgByAddress(body!.hostAddr);
        try {
            await TradingSession.create({
                secret,
                hostAddr: body!.hostAddr,
                hostAssetsJson: assets,
                hostNanoErg: nanoErg,
            });
        } catch (e) {
            console.error(e.message);
            res.status(500);
            res.send("Error while creating session");
            return;
        }
        res.status(200);
        res.send({secret});
    } catch (err) {
        console.error(err.message);
        res.status(500);
        res.send("Server-side error while creating a trading session");
    }
});

app.post('/session/enter', async (req, res) => {
    try {
        const bodyIsValid = await utils.validateObject(req.body, types.SessionEnterBodySchema);
        if (!bodyIsValid) {
            res.status(400);
            res.send('Invalid body');
            return;
        }
        const body: { secret: string, guestAddr: string } = req.body;
        if (!ErgoAddress.validate(body!.guestAddr)) {
            res.status(400);
            res.send("Invalid guestAddr");
            return;
        }
        const {assets, nanoErg} = await utils.getAssetsAndNanoErgByAddress(body!.guestAddr);
        const {status: updateStatus, message: updateMessage} = await utils.updateSession(body.secret, {
            guestAddr: body.guestAddr,
            guestAssetsJson: assets,
            guestNanoErg: nanoErg
        });
        if (updateStatus !== 200) {
            res.status(updateStatus);
            res.send(updateMessage);
            return;
        }
        res.status(200);
        res.send({});
    } catch (err) {
        console.error(err.message);
        res.status(500);
        res.send("Server-side error while entering a trading session");
    }
});

app.get('/session/info', async (req, res) => {
    try {
        const {status, result} = await utils.getSessionByQuery(req);
        if(status !== 200) {
            res.status(status);
            res.send(result);
            return;
        }
        const session = result as TradingSession;
        const {nfts: hostNfts, fungibleTokens: hostFungibleTokens} = utils.splitAssets(session.hostAssetsJson);
        const {nfts: guestNfts, fungibleTokens: guestFungibleTokens} = utils.splitAssets(session.guestAssetsJson);
        res.status(200);
        res.send({
            host: {
                address: session.hostAddr,
                nfts: hostNfts,
                fungibleTokens: hostFungibleTokens,
                nanoErg: session.hostNanoErg,
            },
            guest: session.guestAddr === null ? undefined : {
                address: session.guestAddr,
                nfts: guestNfts,
                fungibleTokens: guestFungibleTokens,
                nanoErg: session.guestNanoErg ?? undefined,
            },
        });
    } catch (err) {
        console.error(err.message);
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
        const body: {secret: string, unsignedTx: EIP12UnsignedTransaction, signedInputsHost: SignedInput[], inputIndicesHost: number[], inputIndicesGuest: number[]} = req.body;
        const {status: updateStatus, message: updateMessage} = await utils.updateSession(body.secret, {
            unsignedTx: body.unsignedTx,
            unsignedTxAddedOn: new Date(),
            signedInputsHost: body.signedInputsHost,
            txInputIndicesHost: body.inputIndicesHost,
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
        console.error(err.message);
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
            return;
        }
        const session = result as TradingSession;
        res.status(200);
        if(session.unsignedTx === null) {
            res.send({});
            return;
        }
        res.send({
            unsignedTx: session.unsignedTx,
            inputIndicesGuest: session.txInputIndicesGuest,
            inputIndicesHost: session.txInputIndicesHost,
            signedInputsHost: session.signedInputsHost,
        })
    } catch (err) {
        console.error(err.message);
        res.status(500);
        res.send("Server-side error while getting info about the partial transaction");
    }
});

// Checks if the transaction for a specific session was submitted to the network already
app.get('/tx', async (req, res) => {
    try {
        const {status, result} = await utils.getSessionByQuery(req);
        if(status !== 200) {
            res.status(status);
            res.send(result);
            return;
        }
        const session = result as TradingSession;
        res.status(200);
        res.send({
            submitted: (session.submittedAt !== null),
            txId: session.txId ?? undefined,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500);
        res.send("Server-side error while getting info about the partial transaction");
    }
});

app.post('/tx/register', async (req, res) => {
    try {
        const bodyIsValid = await utils.validateObject(req.body, types.TxRegisterBodySchema);
        if(!bodyIsValid) {
            res.status(400);
            res.send('Invalid body');
            return;
        }
        const body: {secret: string, txId: string} = req.body;
        const {status, message} = await utils.updateSession(body.secret, {
            submittedAt: new Date(),
            txId: body.txId,
        });
        if(status !== 200) {
            res.status(status);
            res.send(message);
            return;
        }
        res.status(200);
        res.send({
            message: "Transaction registered successfully",
        });
    } catch (err) {
        console.error(err.message);
        res.status(500);
        res.send("Server-side error while registering the transaction");
    }
});

app.listen(config.backendPort, () => {
    console.log(`server running on port ${config.backendPort}`);
});