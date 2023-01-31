interface ConfigType {
  blockchainApiUrl: string;
}

export const config: ConfigType = {
  blockchainApiUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_API_URL as string,
};
