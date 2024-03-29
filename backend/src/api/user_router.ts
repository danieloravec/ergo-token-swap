import Router, {Request, Response} from 'express'
import * as utils from "@utils";
import User from "@db/models/user";
import TradingSession from "@db/models/trading_session";
import {Op, QueryTypes} from "sequelize";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import {config} from "@config";
import {ensureAuth, verifyJwt} from "@utils";
import sequelizeConnection from "@db/config";
import * as types from "@types";
import Follow from "@db/models/follow";

const userRouter = Router();

userRouter.get('/', async (req, res) => {
    try {
      if (!utils.ensureAddressValid(req, res, req.query?.address as string | undefined)) {
        return;
      }
      const user = await utils.getUserOrSend400(req, res, req.query!.address as string);
      if (!user) {
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
    const t = await sequelizeConnection.transaction();
    if (!utils.ensureAddressValid(req, res, req.body?.address)) {
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
      user = await User.findOne({where: {address: req.body.address}, transaction: t});
    } catch (err) {
      await t.rollback();
      console.error(err.message);
      res.status(500);
      res.send("Server-side error while checking if user exists");
      return;
    }

    if(user) {
      if(!req.body?.signature) {
        await t.rollback();
        res.status(200);
        res.send(user);
        return;
      }
      if (!utils.verifySignature(JSON.stringify(data), req.body.signature)) {
        await t.rollback();
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
        await User.update(updatedUserData, {where: {address: req.body.address}, transaction: t});
        user = {
          address: req.body.address,
          ...updatedUserData
        } as User;
      } catch (e) {
        await t.rollback();
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
          allowMessages: true,
        }, {transaction: t});
      } catch (e) {
        await t.rollback();
        console.error(JSON.stringify(e));
        res.status(500);
        res.send("Error while creating the user");
        return;
      }
    }

    await t.commit();
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
    if (!utils.ensureAddressValid(req, res, req.query?.address as string | undefined)) {
      return;
    }
    const address = req.query!.address as string;
    const {assets, nanoErg} = await utils.getAssetsAndNanoErgByAddress(address);
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
    if (!utils.ensureAddressValid(req, res, req.query?.address as string | undefined)) {
      return;
    }
    const address = req.query!.address as string;

    const user = await utils.getUserOrSend400(req, res, address);
    if (!user) {
      return;
    }
    const userSwapHistory = await TradingSession.findAll(
      {
        attributes: [['submitted_at', 'timestamp'], 'host_addr', 'guest_addr', 'tx_id'],
        where: {
          [Op.or]: [
            { guestAddr: address },
            { hostAddr: address }
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
    if (!utils.ensureAddressValid(req, res, req.query?.address as string | undefined)) {
      return;
    }
    const user = await utils.getUserOrSend400(req, res, req.query!.address as string);
    if (!user) {
      return;
    }
    const secret = crypto.randomBytes(16).toString('hex');
    await User.update(
      {
        ...user,
        authSecret: secret,
      },
      {where: {address: req.query!.address as string}}
    );
    res.status(200);
    res.send({secret});
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send("Server-side error while preparing auth secret");
  }
});

userRouter.post('/auth', async (req, res) => {
  try {
    if (!utils.ensureAddressValid(req, res, req.body?.address)) {
      return;
    }
    const user = await utils.getUserOrSend400(req, res, req.body!.address);
    if (!user) {
      return;
    }
    if (!utils.verifySignature(user.authSecret, req.body.signature)) {
      res.status(400);
      res.send("Invalid signature");
      return;
    }
    const token = jwt.sign({address: req.body!.address, timestamp: Date.now()}, config.jwtSecret);
    res.status(200);
    res.send({jwt: token});
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send("Server-side error while preparing jwt");
  }
});

userRouter.post('/auth/check', async (req, res) => {
  try {
    if (!utils.ensureAddressValid(req, res, req.body?.address)) {
      return;
    }
    let isAuthenticated = false;
    if(req.body.jwt !== undefined && typeof req.body.jwt === "string") {
      isAuthenticated = verifyJwt(req.body.address, req.body.jwt);
    }
    res.send({isAuthenticated});
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send("Server-side error while validating jwt");
  }
});

userRouter.get('/stats', async (req, res) => {
  try {
    if (!utils.ensureAddressValid(req, res, req.query?.address as string | undefined)) {
      return;
    }
    const userStats = await sequelizeConnection.query(
      'SELECT uas.token_id, uas.amount_bought, uas.amount_sold, ' +
      'CASE WHEN a.is_verified IS NULL THEN false ELSE a.is_verified END as is_verified ' +
      'FROM user_asset_stats uas ' +
      'LEFT JOIN assets a ON uas.token_id = a.token_id ' +
      'WHERE uas.user_address = :address ' +
      'ORDER BY uas.amount_bought DESC',
      {
        replacements: { address: req.query!.address },
        type: QueryTypes.SELECT,
        raw: true,
      }
    );
    res.send(userStats);
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send("Server-side error while getting the user's stats");
  }
});

userRouter.get('/follow/specific', async (req: Request, res: Response) => {
  try {
    const fromAddress = req.query.fromAddress as string;
    const toAddress = req.query.toAddress as string;
    if (!utils.ensureAddressValid(req, res, fromAddress)) {
      return;
    }
    if (!utils.ensureAddressValid(req, res, toAddress)) {
      return;
    }

    const follow = await Follow.findOne({
      where: {
        fromAddress,
        toAddress,
      },
      raw: true,
    });

    res.send({
      followed: !!follow
    });
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send({
      message: "Server-side error while getting follow info"
    })
  }
});

userRouter.get('/follow', async (req: Request, res: Response) => {
  try {
    const fromAddress = req.query.fromAddress as string;
    if (!utils.ensureAddressValid(req, res, fromAddress)) {
      return;
    }

    const friends = await sequelizeConnection.query(
      'SELECT * ' +
      'FROM users u ' +
      'WHERE u.address IN ( ' +
      '  SELECT f.to_address ' +
      '  FROM follows f ' +
      '  WHERE f.from_address = :fromAddress' +
      ')',
      {
        replacements: { fromAddress },
        type: QueryTypes.SELECT,
        raw: true,
      }
    );

    res.send(friends);
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send({
      message: "Server-side error while getting follow info"
    })
  }
});

userRouter.post('/follow', async (req: Request, res: Response) => {
  try {
    const user = await utils.ensureFollowBodyValidReturnUser(req, res);
    if (!user) {
      return;
    }

    if (!utils.ensureAuth(req, res, req.body.fromAddress)) {
      return;
    }

    await Follow.create({
      fromAddress: req.body.fromAddress,
      toAddress: req.body.toAddress
    });

    res.send({followed: true});
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send({
      message: 'Server-side error while adding a follow'
    });
  }
});

userRouter.delete('/follow', async (req: Request, res: Response) => {
  try {
    const user = await utils.ensureFollowBodyValidReturnUser(req, res);
    if (!user) {
      return;
    }

    if (!utils.ensureAuth(req, res, req.body.fromAddress)) {
      return;
    }

    const affected = await Follow.destroy({
      where: {
        fromAddress: req.body.fromAddress,
        toAddress: req.body.toAddress,
      }
    });

    if (affected === 0) {
      res.status(400);
      res.send({
        message: "Follow relationship does not exist"
      });
      return;
    }

    res.send({followed: false});
  } catch (err) {
    res.status(500);
    res.send({
      message: "Server-side error while removing a follow"
    })
  }
});

export default userRouter;