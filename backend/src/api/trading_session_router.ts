import Router from 'express';
import * as utils from "@utils";
import * as types from "@types";
import {ErgoAddress} from "@fleet-sdk/core";
import {randomBytes} from "crypto";
import TradingSession from "@db/models/trading_session";

const tradingSessionRouter = Router();

tradingSessionRouter.post('/create', async (req, res) => {
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

tradingSessionRouter.post('/enter', async (req, res) => {
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

tradingSessionRouter.get('/info', async (req, res) => {
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

export default tradingSessionRouter;