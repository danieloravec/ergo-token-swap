import Session from '@db/models/session';
import {config} from '@config';

Session.sync({force: config.debug});
