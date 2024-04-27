import { explorerRequest } from '@ergo/utils';
import { blitzData, BLITZ_MINT_ADDRESS } from '@utils/special/blitz';
import { config } from '@config';

export const P2PK_ERGO_TREE_PREFIX = '0008cd';

export const getMintAddressByTokenId = async (
  tokenId: string
): Promise<string | undefined> => {
  // Specialized
  if (tokenId in blitzData) {
    return BLITZ_MINT_ADDRESS;
  }
  if (config.specialOnly) {
    return undefined;
  }

  // General
  const MAX_CHAIN_LENGTH = 1;
  try {
    const boxResponse = await explorerRequest(`/boxes/${tokenId}`, 1);
    const nftTxId = boxResponse?.transactionId;
    const nftTxInfoResponse = await explorerRequest(
      `/transactions/${nftTxId}`,
      1
    );
    let firstTxInput: {
      address: string;
      ergoTree: string;
      outputTransactionId: string;
      [key: string]: any;
    } = nftTxInfoResponse?.inputs[0];
    let chainLength = 1;
    while (
      chainLength < MAX_CHAIN_LENGTH &&
      !firstTxInput.ergoTree.startsWith(P2PK_ERGO_TREE_PREFIX)
    ) {
      const prevTxId = firstTxInput.outputTransactionId;
      const txInfoReponse = await explorerRequest(
        `/transactions/${prevTxId}`,
        1
      );
      firstTxInput = txInfoReponse?.inputs[0];
      chainLength += 1;
    }
    return firstTxInput.address;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};
