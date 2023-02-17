import { OutputBuilder, TransactionBuilder } from '@fleet-sdk/core';
import { type Wallet } from '@ergo/wallet';
import { config } from '@config';
import { type EIP12UnsignedTransaction } from '@fleet-sdk/common';
import * as utils from '@ergo/utils';
import { Loader } from '@ergo/loader';

interface BuildMultisigSwapTxParams {
  wallet: Wallet;
  addressA: string;
  assetsToReceiveByA: Record<string, bigint>;
  nanoErgToReceiveByA: bigint;
  addressB: string;
  assetsToReceiveByB: Record<string, bigint>;
  nanoErgToReceiveByB: bigint;
}

export async function buildUnsignedMultisigSwapTx({
  wallet,
  addressA,
  assetsToReceiveByA,
  nanoErgToReceiveByA,
  addressB,
  assetsToReceiveByB,
  nanoErgToReceiveByB,
}: BuildMultisigSwapTxParams): Promise<{
  unsignedTx: EIP12UnsignedTransaction;
  inputIndicesA: number[];
  inputIndicesB: number[];
}> {
  const creationHeight = await wallet.getCurrentHeight();
  const inputsA = await utils.getInputs(addressA);
  const inputsB = await utils.getInputs(addressB);

  if (inputsA.length === 0 || inputsB.length === 0) {
    throw new Error('No inputs found for at least one of the participants');
  }

  const changeToA = utils.aggregateTokensInfo(inputsA); // We'll subtract appropriate value from this later
  const changeToB = utils.aggregateTokensInfo(inputsB);
  for (const tokenId in assetsToReceiveByB) {
    changeToA[tokenId] -= assetsToReceiveByB[tokenId];
  }
  for (const tokenId in assetsToReceiveByA) {
    changeToB[tokenId] -= assetsToReceiveByA[tokenId];
  }
  const nanoErgChangeToA = utils.aggregateInputsNanoErgValue(inputsA);
  const nanoErgChangeToB = utils.aggregateInputsNanoErgValue(inputsB);

  const outputs = [
    new OutputBuilder(
      nanoErgChangeToA + nanoErgToReceiveByA - config.serviceFeeNanoErg,
      addressA
    ).addTokens([
      ...Object.keys(assetsToReceiveByA).map((tokenId) => ({
        tokenId,
        amount: assetsToReceiveByA[tokenId],
      })),
    ]),
    new OutputBuilder(
      nanoErgChangeToB + nanoErgToReceiveByB - config.serviceFeeNanoErg,
      addressB
    ).addTokens([
      ...Object.keys(assetsToReceiveByB).map((tokenId) => ({
        tokenId,
        amount: assetsToReceiveByB[tokenId],
      })),
    ]),
  ];

  const unsignedTx = new TransactionBuilder(creationHeight)
    .from([...inputsA, ...inputsB])
    .to(outputs)
    .sendChangeTo(config.serviceFeeAddress) // Only 2 * config.serviceFeeNanoErg will be in change
    .payMinFee()
    .build('EIP-12');

  const inputIndicesA: number[] = [];
  const inputIndicesB: number[] = [];
  unsignedTx.inputs.forEach((input, index) => {
    if (input.ergoTree === inputsA[0].ergoTree) {
      inputIndicesA.push(index);
    } else if (input.ergoTree === inputsB[0].ergoTree) {
      inputIndicesB.push(index);
    } else {
      throw new Error('Unexpected input');
    }
  });

  await Loader.load();
  const txId = Loader.Ergo.UnsignedTransaction.from_json(
    JSON.stringify(unsignedTx)
  )
    .id()
    .to_str();

  return {
    unsignedTx: {
      ...unsignedTx,
      id: txId,
    },
    inputIndicesA,
    inputIndicesB,
  };
}

// export async function buildTxExample(wallet: Wallet): Promise<void> {
//   const address = await wallet.getAddress();
//   console.log(`address: ${address}`);
//
//   const creationHeight = await wallet.getCurrentHeight();
//   const inputs = await utils.getInputs(address);
//
//   const unsignedTransaction = new TransactionBuilder(creationHeight)
//     .from(inputs)
//     .to(
//       new OutputBuilder(
//         BigInt(1000000000),
//         '9ez4QZZnrhRnXcFa4xupxtSU1cnkq7FaGPbRx2ygxe6ZGg5wBLR'
//       )
//     )
//     .sendChangeTo(address)
//     .payMinFee()
//     .build('EIP-12');
//
//   const signedTransaction = await wallet.signTx(unsignedTransaction);
//
//   const txId = await wallet.submitTx(signedTransaction);
//   console.log(`txId: ${txId}`);
// }
