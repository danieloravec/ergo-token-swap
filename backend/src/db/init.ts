import Session from '@db/models/session';

const dbInit = () => {
    Session.sync();
}
export default dbInit;