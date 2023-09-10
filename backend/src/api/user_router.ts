import Router, {Request, Response} from 'express'
import * as utils from "@utils";
import User from "@db/models/user";
import TradingSession from "@db/models/trading_session";
import {Op, QueryTypes} from "sequelize";
import * as jwt from "jsonwebtoken";
import {config} from "@config";
import {ensureAuth, verifyJwt} from "@utils";
import sequelizeConnection from "@db/config";
import Follow from "@db/models/follow";
import {buildAuthTx} from "@ergo/transactions";
import JSONBig from "json-bigint";

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
      if (!utils.ensureAuth(req, res, data.address)) {
        await t.rollback();
        return;
      }
      try {
        const updatedUserData = {
          username: req.body.username ?? user.username,
          email: req.body.email ?? user.email,
          discord: req.body.discord ?? user.discord,
          twitter: req.body.twitter ?? user.twitter,
          allow_messages: req.body.allowMessages ?? user.allow_messages,
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
          allow_messages: true,
        }, {transaction: t});
      } catch (e) {
        await t.rollback();
        console.error(JSONBig.stringify(e));
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
            { guest_addr: address },
            { host_addr: address }
          ],
          [Op.not]: {
            tx_id: null
          }
        },
        order: [['submitted_at', 'DESC']],
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
      console.log('[GET] /auth: Address invalid');
      return;
    }
    const user = await utils.getUserOrSend400(req, res, req.query!.address as string);
    if (!user) {
      console.log('[GET] /auth: User not found');
      return;
    }

    const { unsignedAuthTx, boxToValidate } = await buildAuthTx(user.address);

    await User.update(
      {
        auth_tx_id: unsignedAuthTx.id,
        auth_tx_box_to_validate: JSONBig.stringify(boxToValidate)
      },
      {where: {address: user.address}}
    );

    res.status(200);
    res.send({unsignedAuthTx});
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send("Server-side error while preparing auth secret");
  }
});

userRouter.post('/auth', async (req, res) => {
  try {
    if (!utils.ensureAddressValid(req, res, req.body?.address)) {
      console.log('[POST] /auth: Address invalid');
      return;
    }
    const user = await utils.getUserOrSend400(req, res, req.body!.address);
    if (!user) {
      console.log('[POST] /auth: User not found');
      return;
    }
    if (!(await utils.verifySignature(req.body.address, req.body.signedTx))) {
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
        from_address: fromAddress,
        to_address: toAddress,
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
      from_address: req.body.fromAddress,
      to_address: req.body.toAddress
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
        from_address: req.body.fromAddress,
        to_address: req.body.toAddress,
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