import { Dialect, Sequelize } from 'sequelize';
import { config } from '@config';

const sequelizeConnection = new Sequelize(config.dbName, config.dbUser, config.dbPassword, {
    host: config.dbHost,
    dialect: 'postgres' as Dialect,
    port: Number(config.dbPort), // We can trust the environment
    logging: false,
});

// This is needed for Sequelize migrations. Each environment needs to be exported. The `development` one is default.
export const development = {
    username: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    host: config.dbHost,
    port: Number(config.dbPort), // We can trust the environment
    dialect: 'postgres' as Dialect,
    logging: false,
}

export default sequelizeConnection;