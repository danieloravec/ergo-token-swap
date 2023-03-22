import * as express from "express";
import * as utils from "@utils";
import * as types from "@types";
import {EIP12UnsignedTransaction, SignedInput} from "@fleet-sdk/common";
import TradingSession from "@db/models/trading_session";

const txRouter = express.Router();


txRouter.post('/partial/register', async (req, res) => {
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
txRouter.get('/partial', async (req, res) => {
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
txRouter.get('/', async (req, res) => {
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

txRouter.post('/register', async (req, res) => {
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

export default txRouter;