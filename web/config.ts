interface ConfigType {
  blockchainApiUrl: string;
}

export const config: ConfigType = {
  blockchainApiUrl: process.env.BLOCKCHAIN_API_URL ?? '',
};
