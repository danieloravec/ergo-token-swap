import { Dialect, Sequelize } from 'sequelize';
import { config } from '@config';

const sequelizeConnection = new Sequelize(config.dbName, config.dbUser, config.dbPassword, {
    host: config.dbHost,
    dialect: config.dbDialect as Dialect,
    port: Number(config.dbPort), // We can trust the environment
})

export default sequelizeConnection