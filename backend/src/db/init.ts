import Session from '@db/models/Session';

const dbInit = () => {
    Session.sync();
}
export default dbInit;