import dotenv from 'dotenv';

dotenv.config();

interface ConfigType {
    blockchainApiUrl: string;
    backendPort: string;
    dbPort: string;
    dbName: string;
    dbUser: string;
    dbHost: string;
    dbPassword: string;
    debug: boolean;
}
export const config: ConfigType = {
    blockchainApiUrl: process.env.BLOCKCHAIN_API_URL as string,
    backendPort: process.env.PORT as string,
    dbPort: process.env.DB_PORT as string,
    dbName: process.env.DB_NAME as string,
    dbUser: process.env.DB_USER as string,
    dbHost: process.env.DB_HOST as string,
    dbPassword: process.env.DB_PASSWORD as string,
    debug: process.env.DEBUG === 'true',
};