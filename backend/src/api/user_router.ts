import Router from 'express'
import * as utils from "@utils";
import User from "@db/models/user";
import {ErgoAddress} from "@fleet-sdk/core";
import TradingSession from "@db/models/trading_session";
import {Op} from "sequelize";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import {config} from "@config";
import {JwtPayload} from "jsonwebtoken";
import {verifyJwt} from "@utils";

const userRouter = Router();

userRouter.get('/', async (req, res) => {
    try {
      if(req.query?.address === undefined || typeof req.query?.address !== "string") {
        res.status(400);
        res.send("Invalid body");
        return;
      }
      const user = await User.findOne({where: {address: req.query!.address}});
      if(!user) {
        res.status(400);
        res.send("User not found");
        return;
      }
      res.status(200);
      res.send(user);
    } catch (err) {
      console.error(err.message);
      res.status(500);
      res.send("Server-side error while getting the user");
    }
});

// For creating and updating users
// TODO incorporate auth flow into this
userRouter.post('/', async (req, res) => {
  try {
    if (req.body?.address === undefined) {
      res.status(400);
      res.send('Missing address');
      return;
    }
    if (!ErgoAddress.validate(req.body!.address)) {
      res.status(400);
      res.send("Invalid address");
      return;
    }

    const data = {
      address: req.body.address,
      username: req.body.username,
      email: req.body.email,
      discord: req.body.discord,
      twitter: req.body.twitter,
      allowMessages: req.body.allowMessages,
    };

    let user: User;
    try {
      user = await User.findOne({where: {address: req.body.address}});
    } catch (err) {
      console.error(err.message);
      res.status(500);
      res.send("Server-side error while checking if user exists");
      return;
    }

    if(user) {
      if (req.body?.signature === undefined || !utils.verifySignature(JSON.stringify(data), req.body.signature)) {
        res.status(400);
        res.send('Invalid data signature');
        return;
      }
      try {
        const updatedUserData = {
          username: req.body.username ?? user.username,
          email: req.body.email ?? user.email,
          discord: req.body.discord ?? user.discord,
          twitter: req.body.twitter ?? user.twitter,
          allowMessages: req.body.allowMessages ?? user.allowMessages,
        }
        await User.update(updatedUserData, {where: {address: req.body.address}});
        user = {
          address: req.body.address,
          ...updatedUserData
        } as User;
      } catch (e) {
        console.error(e.message);
        res.status(500);
        res.send("Error while updating the user");
        return;
      }
    } else {
      try {
        user = await User.create({
          address: req.body.address,
          username: req.body.username,
          email: req.body.email,
          discord: req.body.discord,
          twitter: req.body.twitter,
          allowMessages: req.body.allowMessages,
        });
      } catch (e) {
        console.error(e.message);
        res.status(500);
        res.send("Error while creating the user");
        return;
      }
    }

    res.status(200);
    res.send(user);
  } catch (err) {
    console.error(err.message);
    res.status(500);
    res.send("Server-side error while creating a user");
  }
});

userRouter.get('/assets', async (req, res) => {
  try {
    if (req.query?.address === undefined || typeof req.query?.address !== "string") {
      res.status(400);
      res.send("Invalid body");
      return;
    }
    const {assets, nanoErg} = await utils.getAssetsAndNanoErgByAddress(req.query.address);
    const {nfts, fungibleTokens} = utils.splitAssets(assets);
    const resBody = {
      nfts,
      fungibleTokens,
      nanoErg: String(nanoErg),
    }
    res.status(200);
    res.send(resBody);
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send("Server-side error while getting the user's assets");
  }
});

userRouter.get('/history', async (req, res) => {
  try {
    if (req.query?.address === undefined || typeof req.query?.address !== "string") {
      res.status(400);
      res.send("Invalid query");
      return;
    }
    const limit = req.query?.limit === undefined ? 100 : Number(req.query?.limit);
    const offset = req.query?.offset === undefined ? 0 : Number(req.query?.offset);

    let user;
    try {
      user = await User.findOne({where: {address: req.query!.address}});
    } catch (err) {
      console.error(err.message);
      res.status(500);
      res.send("Server-side error while checking if user exists");
      return;
    }
    if(!user) {
      res.status(400);
      res.send("User not found");
      return;
    }
    const userSwapHistory = await TradingSession.findAll(
      {
        attributes: [['submitted_at', 'timestamp'], 'host_addr', 'guest_addr', 'tx_id'],
        where: {
          [Op.or]: [
            { guestAddr: req.query!.address },
            { hostAddr: req.query!.address }
          ],
          [Op.not]: {
            txId: null
          }
        },
        order: [['submittedAt', 'DESC']],
      },
    );
    res.send(userSwapHistory);
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send("Server-side error while getting the user's history");
  }
});

userRouter.get('/auth', async (req, res) => {
  try {
    if (req.query?.address === undefined || typeof req.query?.address !== "string" || !ErgoAddress.validate(req.query!.address)) {
      res.status(400);
      res.send("Invalid address");
      return;
    }
    const user = await User.findOne({where: {address: req.query!.address}});
    if (!user) {
      res.status(400);
      res.send("User not found");
      return;
    }
    const secret = crypto.randomBytes(16).toString('hex');
    await User.update(
      {
        ...user,
        authSecret: secret,
      },
      {where: {address: req.query!.address}}
    );
    res.status(200);
    res.send(secret);
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send("Server-side error while preparing auth secret");
  }
});

userRouter.post('/auth', async (req, res) => {
  try {
    if (
      req.body?.address === undefined ||
      typeof req.body?.address !== "string" ||
      !ErgoAddress.validate(req.body!.address) ||
      req.body?.signature === undefined ||
      typeof req.body?.signature !== "string") {
      res.status(400);
      res.send("Invalid address");
      return;
    }
    const user = await User.findOne({where: {address: req.body!.address}});
    if (!user) {
      res.status(400);
      res.send("User not found");
      return;
    }
    if (!utils.verifySignature(user.authSecret, req.body.signature)) {
      res.status(400);
      res.send("Invalid signature");
      return;
    }
    const token = jwt.sign({address: req.query!.address, timestamp: Date.now()}, config.jwtSecret);
    res.status(200);
    res.send(token);
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send("Server-side error while preparing jwt");
  }
});

userRouter.post('/auth/check', async (req, res) => {
  try {
    if (req.body?.address === undefined || typeof req.body?.address !== "string" || !ErgoAddress.validate(req.body!.address)) {
      res.status(400);
      res.send("Invalid address");
      return;
    }
    let isAuthenticated = false;
    if(req.body.jwt !== undefined || typeof req.body.jwt === "string") {
      isAuthenticated = verifyJwt(req.body.address, req.body.jwt);
    }
    res.send({isAuthenticated});
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send("Server-side error while validating jwt");
  }
});

export default userRouter;