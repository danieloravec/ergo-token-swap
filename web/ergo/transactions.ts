import { OutputBuilder, TransactionBuilder } from '@fleet-sdk/core';
import { type Box, type Amount } from '@fleet-sdk/core';
import { type Wallet } from '@ergo/wallet';

export async function explorerRequest(endpoint: string): Promise<any> {
  const res = await fetch(`https://api.ergoplatform.com/api/v0${endpoint}`);
  return await res.json();
}

export async function buildTxExample(wallet: Wallet): Promise<void> {
  const address = await wallet.getAddress();
  const inputsResponse = await explorerRequest(
    `/transactions/boxes/byAddress/unspent/${address}`
  );

  const creationHeight = await wallet.getCurrentHeight();
  const inputs: Array<Box<Amount>> = inputsResponse.map((input: any) => {
    return {
      ergoTree: input.ergoTree,
      creationHeight: input.creationHeight,
      value: String(input.value),
      assets: input.assets,
      additionalRegisters: input.additionalRegisters,
      boxId: input.id,
      transactionId: input.txId,
      index: input.index,
    };
  });

  const unsignedTransaction = new TransactionBuilder(creationHeight)
    .from(inputs)
    .to(
      new OutputBuilder(
        BigInt(100000000),
        '9ez4QZZnrhRnXcFa4xupxtSU1cnkq7FaGPbRx2ygxe6ZGg5wBLR'
      )
    )
    .sendChangeTo(address)
    .payMinFee()
    .build('EIP-12');

  const signedTransaction = await wallet.signTx(unsignedTransaction);

  const txId = await wallet.submitTx(signedTransaction);
  console.log(`txId: ${txId}`);
}
