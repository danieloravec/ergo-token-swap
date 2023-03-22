import TradingSession from '@db/models/trading_session';
import {config} from '@config';

TradingSession.sync({force: config.debug, logging: console.log}).then(() => {
  console.log("Database synced");
});
