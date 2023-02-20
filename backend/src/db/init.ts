import Session from '@db/models/session';
import {config} from '@config';

Session.sync({force: config.debug, logging: console.log}).then(() => {
  console.log("Database synced");
});
