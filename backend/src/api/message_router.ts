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
    if (!utils.ensureAuth(req, res, req.query.address)) {
      return;
    }

    const user = await User.findOne({where: {address: req.query.address}});
    if(!user) {
      res.status(400);
      res.send("User not found");
      return;
    }
    const receivedMessages = await Message.findAll({
      where: {
        to_address: req.query.address,
        receiver_archived: false
      },
      order: [['created_at', 'DESC']],
      raw: true
    });
    const sentMessages = await Message.findAll({
      where: {
        from_address: req.query.address,
        sender_archived: false,
      },
      order: [['created_at', 'DESC']],
      raw: true
    });
    res.send({
      received: receivedMessages,
      sent: sentMessages
    });
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
      subject: string,
      text: string,
    } = req.body;
    if (!ErgoAddress.validate(body.fromAddress) || !ErgoAddress.validate(body.toAddress)) {
      res.status(400);
      res.send("Invalid address");
      return;
    }
    if (!utils.ensureAuth(req, res, body.fromAddress)) {
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
        from_address: body.fromAddress,
        to_address: body.toAddress,
        subject: body.subject,
        text: body.text,
      });
    } catch (e) {
      console.error(e.message);
      res.status(500);
      res.send("Error while creating a message");
      return;
    }
    res.status(200);
    res.send({message: 'OK'});
  } catch (err) {
    console.error(err.message);
    res.status(500);
    res.send("Server-side error while creating a message");
  }
});

messageRouter.delete('/', async (req, res) => {
  try {
    const bodyIsValid = await utils.validateObject(req.body, types.MessageDeleteBodySchema);
    if (!bodyIsValid) {
      res.status(400);
      res.send('Invalid body');
      return;
    }
    const body: {
      id: number,
    } = req.body;

    const message = await Message.findOne({where: {id: body.id}});
    if (!message) {
      res.status(404);
      res.send({message: 'Message not found'});
      return;
    }

    if (!utils.ensureAuth(req, res, message.to_address)) {
      return;
    }

    await Message.destroy({where: {id: body.id}});

    res.status(200);
    res.send({message: 'OK'});
  } catch (err) {
    console.error(err.message);
    res.status(500);
    res.send("Server-side error while deleting a message");
  }
});

messageRouter.put('/archive', async (req, res) => {
  try {
    const messageId = Number(req.query?.id);
    if (Number.isNaN(messageId)) {
      res.status(400);
      res.send('Invalid query');
      return;
    }

    const message = await Message.findOne({where: {id: messageId}});
    if (!message) {
      res.status(404);
      res.send({message: 'Message not found'});
      return;
    }

    const authorizationTokenized = req.header("Authorization")?.split(' ');
    if (authorizationTokenized.length < 2) {
      res.status(400);
      res.send("Invalid authorization header");
      return;
    }
    const jwt = authorizationTokenized[1];
    const senderIsAuthorized = utils.verifyJwt(message.from_address, jwt);
    const receiverIsAuthorized = utils.verifyJwt(message.to_address, jwt);
    if(!senderIsAuthorized && !receiverIsAuthorized) {
      res.status(401);
      res.send("Unauthorized");
      return;
    }

    if (senderIsAuthorized) {
      await Message.update({sender_archived: true}, {where: {id: messageId}});
    } else {
      await Message.update({receiver_archived: true}, {where: {id: messageId}});
    }

    res.status(200);
    res.send({message: 'OK'});
  } catch (err) {
    console.error(err.message);
    res.status(500);
    res.send("Server-side error while archiving a message");
  }
});

messageRouter.put('/seen', async (req, res) => {
  try {
    const messageId =  Number(req.query?.id);
    const newSeenValue = req.body?.seen;
    if (Number.isNaN(messageId) || typeof newSeenValue !== 'boolean') {
      res.status(400);
      res.send('Invalid query or body');
      return;
    }

    const message = await Message.findOne({where: {id: messageId}});
    if (!message) {
      res.status(404);
      res.send({message: 'Message not found'});
      return;
    }

    if (!utils.ensureAuth(req, res, message.to_address)) {
      return;
    }

    await Message.update({seen: newSeenValue}, {where: {id: messageId}})
    res.status(200);
    res.send({message: 'OK'});

  } catch (err) {
    console.error(err.message);
    res.status(500);
    res.send("Server-side error while marking message as seen / unseen");
  }
});

export default messageRouter;