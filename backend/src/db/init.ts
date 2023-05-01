import TradingSession from '@db/models/trading_session';
import User from '@db/models/user';
import {config} from '@config';
import Message from "@db/models/message";
import Asset from "@db/models/asset";
import UserAssetStats from "@db/models/user_asset_stats";
import Follow from "@db/models/follow";

TradingSession.sync({force: config.debug, logging: console.log}).then(() => {
  console.log("TradingSessions synced");
});

User.sync({force: config.debug, logging: console.log}).then(() => {
  console.log("Users synced");
});

Message.sync({force: config.debug, logging: console.log}).then(() => {
  console.log("Messages synced");
});

Asset.sync({force: config.debug, logging: console.log}).then(() => {
  console.log("Assets synced");
});

UserAssetStats.sync({force: config.debug, logging: console.log});

Follow.sync({force: config.debug, logging: console.log});
