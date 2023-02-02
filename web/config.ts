interface ConfigType {
  blockchainApiUrl: string;
  nodeApiUrl: string;
}

export const config: ConfigType = {
  blockchainApiUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_API_URL as string,
  nodeApiUrl: process.env.NEXT_PUBLIC_NODE_API_URL as string,
};
