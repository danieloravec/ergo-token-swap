import dotenv from 'dotenv';
import * as process from "process";
import {Network} from "@fleet-sdk/core";

dotenv.config();

interface ConfigType {
    blockchainApiUrl: string;
    graphQlZelcoreUrl: string;
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
    serviceFeeAddress: string;
    serviceFeeNanoErg: bigint;
    minNanoErgValue: bigint;
    rewardsWalletMnemonic: string;
    rewardsWalletPassword: string;
    rewardsCampaignEnabled: boolean;
    rewardReservedForHours: number;
    maxMintedPerTx: number;
    mintPriceNanoErg: bigint;
}
export const config: ConfigType = {
    blockchainApiUrl: process.env.BLOCKCHAIN_API_URL as string,
    graphQlZelcoreUrl: process.env.GRAPHQL_ZELCORE_URL as string,
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
    serviceFeeAddress: process.env.SERVICE_FEE_ADDRESS as string,
    serviceFeeNanoErg: BigInt(process.env.SERVICE_FEE_NANO_ERG as string),
    minNanoErgValue: BigInt(process.env.MIN_NANO_ERG_VALUE as string),
    rewardsWalletMnemonic: process.env.REWARDS_WALLET_MNEMONIC as string,
    rewardsWalletPassword: process.env.REWARDS_WALLET_PASSWORD as string,
    rewardsCampaignEnabled: (process.env.REWARDS_CAMPAIGN_ENABLED as string) === 'true',
    rewardReservedForHours: Number(process.env.REWARD_RESERVED_FOR_HOURS as string),
    maxMintedPerTx: Number(process.env.MAX_MINTED_PER_TX as string),
    mintPriceNanoErg: BigInt(process.env.MINT_PRICE_NANO_ERG as string),
};