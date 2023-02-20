import Session from '@db/models/session';
import {config} from '@config';

Session.sync({force: true}).then(() => {
  console.log("Database synced");
});
