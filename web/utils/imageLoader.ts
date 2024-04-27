import { explorerRequest } from '@ergo/utils';
import { blitzData } from '@utils/special/blitz';
import { config } from '@config';

export const loadNftImageUrl = async (
  tokenId: string
): Promise<string | undefined> => {
  // Specific
  if (tokenId in blitzData) {
    return blitzData[tokenId].image;
  }
  if (config.specialOnly) {
    return undefined;
  }
  // General
  const issuingBoxResponse = await explorerRequest(
    `/assets/${tokenId}/issuingBox`,
    0
  );
  if (issuingBoxResponse !== undefined && issuingBoxResponse.length > 0) {
    const registers = issuingBoxResponse[0].additionalRegisters;
    // Make sure it is an NFT picture artwork using R7 and get the image from R9
    if (
      registers.R7 !== undefined &&
      registers.R7 === '0e020101' &&
      registers.R9 !== undefined
    ) {
      let url = Buffer.from(registers.R9.substring(4), 'hex').toString('utf-8');
      if (url.startsWith('ipfs://')) {
        url = 'https://ipfs.io/ipfs/' + url.substring(7);
      } else if (url.startsWith('http://')) {
        url = 'https://' + url.substring(7);
      }
      return url;
    }
  }
};
