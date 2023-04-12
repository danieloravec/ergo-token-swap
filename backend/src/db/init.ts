import TradingSession from '@db/models/trading_session';
import User from '@db/models/user';
import {config} from '@config';
import Message from "@db/models/message";

TradingSession.sync({force: config.debug, logging: console.log}).then(() => {
  console.log("TradingSessions synced");
});

User.sync({force: config.debug, logging: console.log}).then(() => {
  console.log("Users synced");
});

Message.sync({force: config.debug, logging: console.log}).then(() => {
  console.log("Messages synced");
});
