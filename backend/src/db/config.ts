import { Dialect, Sequelize } from 'sequelize';
import { config } from '@config';

const sequelizeConnection = new Sequelize(config.dbName, config.dbUser, config.dbPassword, {
    host: config.dbHost,
    dialect: 'postgres' as Dialect,
    port: Number(config.dbPort), // We can trust the environment
    logging: false,
});

export default sequelizeConnection;