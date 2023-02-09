interface ConfigType {
  explorerApiUrl: string;
  nodeApiUrl: string;
  backendUrl: string;
}

export const config: ConfigType = {
  explorerApiUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_API_URL as string,
  nodeApiUrl: process.env.NEXT_PUBLIC_NODE_API_URL as string,
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL as string,
};
