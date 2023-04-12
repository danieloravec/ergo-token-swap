import Router from 'express'
import * as utils from "@utils";
import * as types from "@types";
import {ErgoAddress} from "@fleet-sdk/core";
import Message from "@db/models/message";
import User from "@db/models/user";

const messageRouter = Router();

messageRouter.get('/', async (req, res) => {
  try {
    if(req.query?.address === undefined || typeof req.query?.address !== "string" || !ErgoAddress.validate(req.query.address)) {
      res.status(400);
      res.send("Invalid address");
      return;
    }
    const jwt = req.header("Authorization");
    if(jwt === undefined || !utils.verifyJwt(req.query.address, jwt)) {
      res.status(401);
      res.send("Unauthorized");
      return;
    }
    const user = await User.findOne({where: {address: req.query.address}});
    if(!user) {
      res.status(400);
      res.send("User not found");
      return;
    }
    const messages = await Message.findAll({
      where:
        req.query?.sent === "true"
          ? {fromAddress: req.query.address}
          : {
            toAddress: req.query.address,
            archived: false
          },
      order: [['createdAt', 'DESC']],
      raw: true
    });
    console.log(`Found messages: ${JSON.stringify(messages)}`);
    res.send({messages});
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send("Server-side error while getting messages");
  }
});

messageRouter.post('/', async (req, res) => {
  try {
    const bodyIsValid = await utils.validateObject(req.body, types.MessageCreateBodySchema);
    if (!bodyIsValid) {
      res.status(400);
      res.send('Invalid body');
      return;
    }
    const body: {
      fromAddress: string,
      toAddress: string,
      text: string,
    } = req.body;
    if (!ErgoAddress.validate(body.fromAddress) || !ErgoAddress.validate(body.toAddress)) {
      res.status(400);
      res.send("Invalid address");
      return;
    }
    const jwt = req.header("Authorization");
    if(jwt === undefined || !utils.verifyJwt(body.fromAddress, jwt)) {
      res.status(401);
      res.send("Unauthorized");
      return;
    }
    const fromUser = await User.findOne({where: {address: body.fromAddress}});
    if(!fromUser) {
      res.status(400);
      res.send("Sender not found");
      return;
    }
    try {
      await Message.create({
        fromAddress: body.fromAddress,
        toAddress: body.toAddress,
        text: body.text,
      });
    } catch (e) {
      console.error(e.message);
      res.status(500);
      res.send("Error while creating a message");
      return;
    }
    res.status(200);
    res.send('OK');
  } catch (err) {
    console.error(err.message);
    res.status(500);
    res.send("Server-side error while creating a message");
  }
});

export default messageRouter;