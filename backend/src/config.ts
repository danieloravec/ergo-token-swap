import dotenv from 'dotenv';
import * as process from "process";
import {Network} from "@fleet-sdk/core";

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
    jwtSecret: string;
    jwtLifespanMs: number;
    network: Network;
    adminSecret: string;
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
    jwtSecret: process.env.JWT_SECRET as string,
    jwtLifespanMs: Number(process.env.JWT_LIFESPAN_MS as string),
    network: process.env.NETWORK === "MAINNET" ? Network.Mainnet : Network.Testnet,
    adminSecret: process.env.ADMIN_SECRET as string,
};