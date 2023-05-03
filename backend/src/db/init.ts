import TradingSession from '@db/models/trading_session';
import User from '@db/models/user';
import {config} from '@config';
import Message from "@db/models/message";
import Asset from "@db/models/asset";
import UserAssetStats from "@db/models/user_asset_stats";
import Follow from "@db/models/follow";
import Collection from "@db/models/collection";

TradingSession.sync({force: config.debug, logging: console.log});

User.sync({force: config.debug, logging: console.log});

Message.sync({force: config.debug, logging: console.log});

Asset.sync({force: config.debug, logging: console.log});

UserAssetStats.sync({force: config.debug, logging: console.log});

Follow.sync({force: config.debug, logging: console.log});

Collection.sync({force: config.debug, logging: console.log});
