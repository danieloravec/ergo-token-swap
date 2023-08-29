import { explorerRequest } from '@utils/utils';

export const P2PK_ERGO_TREE_PREFIX = '0008cd';

export const getMintAddressByTokenId = async (
  tokenId: string
): Promise<string | undefined> => {
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
    while (!firstTxInput.ergoTree.startsWith(P2PK_ERGO_TREE_PREFIX)) {
      const prevTxId = firstTxInput.outputTransactionId;
      const txInfoReponse = await explorerRequest(
        `/transactions/${prevTxId}`,
        1
      );
      firstTxInput = txInfoReponse?.inputs[0];
    }
    return firstTxInput.address;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};
