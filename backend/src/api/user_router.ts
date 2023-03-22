import Router from 'express'
import * as utils from "@utils";
import * as types from "@types";
import User from "@db/models/user";
import {ErgoAddress} from "@fleet-sdk/core";

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
userRouter.post('/', async (req, res) => {
  try {
    if (req.body?.address === undefined || req.body?.signature === undefined) {
      res.status(400);
      res.send('Invalid body');
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
    if (!utils.verifySignature(data, req.body.signature)) {
      res.status(400);
      res.send('Invalid data signature');
      return;
    }

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
      try {
        await User.update({
          username: req.body.username ?? user.username,
          email: req.body.email ?? user.email,
          discord: req.body.discord ?? user.discord,
          twitter: req.body.twitter ?? user.twitter,
          allowMessages: req.body.allowMessages ?? user.allowMessages,
        }, {where: {address: req.body.address}});
      } catch (e) {
        console.error(e.message);
        res.status(500);
        res.send("Error while updating the user");
        return;
      }
    } else {
      try {
        await User.create({
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
    res.send(req.body.address);
  } catch (err) {
    console.error(err.message);
    res.status(500);
    res.send("Server-side error while creating a user");
  }
});

export default userRouter;