import { OutputBuilder, TransactionBuilder } from '@fleet-sdk/core';
import { type Wallet } from '@ergo/wallet';
import { config } from '@config';
import { type EIP12UnsignedTransaction } from '@fleet-sdk/common';
import * as utils from '@ergo/utils';
import { Loader } from '@ergo/loader';

interface BuildMultisigSwapTxParams {
  wallet: Wallet;
  addressA: string;
  assetsToReceiveByAFromB: Record<string, bigint>;
  nanoErgToReceiveByAFromB: bigint;
  addressB: string;
  assetsToReceiveByBFromA: Record<string, bigint>;
  nanoErgToReceiveByBFromA: bigint;
}

export async function buildUnsignedMultisigSwapTx({
  wallet,
  addressA,
  assetsToReceiveByAFromB,
  nanoErgToReceiveByAFromB,
  addressB,
  assetsToReceiveByBFromA,
  nanoErgToReceiveByBFromA,
}: BuildMultisigSwapTxParams): Promise<{
  unsignedTx: EIP12UnsignedTransaction;
  inputIndicesA: number[];
  inputIndicesB: number[];
}> {
  await Loader.load();
  const creationHeight = await wallet.getCurrentHeight();
  const inputsA = await utils.getInputs(addressA);
  const inputsB = await utils.getInputs(addressB);

  if (inputsA.length === 0 || inputsB.length === 0) {
    throw new Error('No inputs found for at least one of the participants');
  }

  const changeAssetsToA = utils.subtractAssets(
    utils.aggregateTokensInfo(inputsA),
    assetsToReceiveByBFromA
  );
  const changeAssetsToB = utils.subtractAssets(
    utils.aggregateTokensInfo(inputsB),
    assetsToReceiveByAFromB
  );

  const allNanoErgA = utils.aggregateInputsNanoErgValue(inputsA);
  const allNanoErgB = utils.aggregateInputsNanoErgValue(inputsB);

  const totalAssetsToReceiveByA = utils.mergeAssets(
    assetsToReceiveByAFromB,
    changeAssetsToA
  );
  const totalAssetsToReceiveByB = utils.mergeAssets(
    assetsToReceiveByBFromA,
    changeAssetsToB
  );

  const outputs = [
    new OutputBuilder(
      allNanoErgA -
        nanoErgToReceiveByBFromA -
        config.serviceFeeNanoErg +
        config.minNanoErgValue,
      addressA
    ).addTokens([
      ...Object.keys(totalAssetsToReceiveByA).map((tokenId) => ({
        tokenId,
        amount: totalAssetsToReceiveByA[tokenId],
      })),
    ]),
    new OutputBuilder(
      allNanoErgB -
        nanoErgToReceiveByAFromB -
        config.serviceFeeNanoErg +
        config.minNanoErgValue,
      addressB
    ).addTokens([
      ...Object.keys(totalAssetsToReceiveByB).map((tokenId) => ({
        tokenId,
        amount: totalAssetsToReceiveByB[tokenId],
      })),
    ]),
  ];

  const unsignedTx = new TransactionBuilder(creationHeight)
    .from([...inputsA, ...inputsB])
    .to(outputs)
    .sendChangeTo(config.serviceFeeAddress) // Only 2 * config.serviceFeeNanoErg will be in change
    .payMinFee()
    .build('EIP-12');

  // Calculate txId from unsignedTx
  const txId = Loader.Ergo.UnsignedTransaction.from_json(
    JSON.stringify(unsignedTx)
  )
    .id()
    .to_str();

  // Calculate boxIds
  unsignedTx.outputs.forEach((output, idx) => {
    unsignedTx.outputs[idx].boxId = Loader.Ergo.ErgoBox.from_json(
      JSON.stringify({
        ...output,
        index: idx,
        transactionId: txId,
      })
    )
      .box_id()
      .to_str();
  });

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

  return {
    unsignedTx: {
      ...unsignedTx,
      id: txId,
    },
    inputIndicesA,
    inputIndicesB,
  };
}
