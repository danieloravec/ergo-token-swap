import { type SupportedThemeName } from '@themes/themes';

interface ConfigType {
  explorerApiUrl: string;
  nodeApiUrl: string;
  backendUrl: string;
  explorerFrontendUrl: string;
  skyHarborApiUrl: string;
  serviceFeeAddress: string;
  serviceFeeNanoErg: bigint;
  defaultThemeName: SupportedThemeName;
  minNanoErgValue: bigint;
  ergTokenId: string;
  customVerification: boolean;
  specialOnly: boolean;
}

export const config: ConfigType = {
  explorerApiUrl: process.env.NEXT_PUBLIC_EXPLORER_API_URL as string,
  nodeApiUrl: process.env.NEXT_PUBLIC_NODE_API_URL as string,
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL as string,
  explorerFrontendUrl: process.env.NEXT_PUBLIC_EXPLORER_FRONTEND_URL as string,
  skyHarborApiUrl: process.env.NEXT_PUBLIC_SKY_HARBOR_API_URL as string,
  serviceFeeAddress: process.env.NEXT_PUBLIC_SERVICE_FEE_ADDRESS as string,
  serviceFeeNanoErg: BigInt(
    process.env.NEXT_PUBLIC_SERVICE_FEE_NANO_ERG as string
  ),
  defaultThemeName: 'dark' as SupportedThemeName,
  minNanoErgValue: BigInt(process.env.NEXT_PUBLIC_MIN_NANO_ERG_VALUE as string),
  ergTokenId:
    '0000000000000000000000000000000000000000000000000000000000000000',
  customVerification: process.env.NEXT_PUBLIC_CUSTOM_VERIFICATION === 'true',
  specialOnly: process.env.NEXT_PUBLIC_SPECIAL_ONLY === 'true',
};
