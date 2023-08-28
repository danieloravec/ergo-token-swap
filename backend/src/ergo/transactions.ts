import { OutputBuilder, TransactionBuilder } from '@fleet-sdk/core';
import { config } from '@config';
import {type EIP12UnsignedTransaction, SignedInput} from '@fleet-sdk/common';
import * as utils from '@ergo/utils';
import { Loader } from '@ergo/loader';
import {explorerRequest} from "@utils";
import JSONBig from "json-bigint";

interface BuildMultisigSwapTxParams {
  addressA: string;
  assetsToReceiveByAFromB: Record<string, bigint>;
  nanoErgToReceiveByAFromB: bigint;
  addressB: string;
  assetsToReceiveByBFromA: Record<string, bigint>;
  nanoErgToReceiveByBFromA: bigint;
  addRewards: boolean;
}

export async function buildUnsignedMultisigSwapTx({
  addressA,
  assetsToReceiveByAFromB,
  nanoErgToReceiveByAFromB,
  addressB,
  assetsToReceiveByBFromA,
  nanoErgToReceiveByBFromA,
  addRewards = false
}: BuildMultisigSwapTxParams): Promise<{
  unsignedTx: EIP12UnsignedTransaction;
  inputIndicesA: number[];
  inputIndicesB: number[];
  inputIndicesRewards: number[];
  signedRewardsInputs: SignedInput[];
}> {
  await Loader.load();
  const creationHeight = (await explorerRequest('/info', 1))?.height;
  if (!creationHeight) {
    throw new Error('Could not get current height');
  }

  const rewardInputs = addRewards ? await utils.getRewardBoxes(2) : [];

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

  const totalAssetsToReceiveByA = utils.mergeAssets([
    assetsToReceiveByAFromB,
    changeAssetsToA,
    addRewards ? utils.getAssetsFromBox(rewardInputs[0]) : {}
  ]);
  const totalAssetsToReceiveByB = utils.mergeAssets([
    assetsToReceiveByBFromA,
    changeAssetsToB,
    addRewards ? utils.getAssetsFromBox(rewardInputs[1]) : {}
  ]);

  const outputs = [
    new OutputBuilder(
      allNanoErgA +
      nanoErgToReceiveByAFromB -
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
      allNanoErgB +
      nanoErgToReceiveByBFromA -
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

  const unsignedTxBuilt = new TransactionBuilder(creationHeight)
    .from([...inputsA, ...inputsB, ...rewardInputs])
    .to(outputs)
    .sendChangeTo(config.serviceFeeAddress) // Only 2 * config.serviceFeeNanoErg will be in change
    .payMinFee()
    .build();
  const unsignedTx = unsignedTxBuilt.toEIP12Object();

  let inputIndicesRewards = [] as number[];
  let signedRewardsInputs = [] as SignedInput[];
  if (addRewards) {
    const rewardsWallet = Loader.Ergo.Wallet.from_mnemonic(config.rewardsWalletMnemonic, config.rewardsWalletPassword);
    inputIndicesRewards = unsignedTx.inputs.map((input, idx) => {
      return input.ergoTree === rewardInputs[0].ergoTree ? idx : -1;
    }).filter((idx) => idx !== -1);
    const headers = (await explorerRequest(`/api/v1/blocks/headers?limit=10`, 1))?.items;
    const blockHeaders = Loader.Ergo.BlockHeaders.from_json(headers);
    const preHeader = Loader.Ergo.PreHeader.from_block_header(blockHeaders.get(0));
    const signContext = new Loader.Ergo.ErgoStateContext(preHeader, blockHeaders);
    const unspentBoxes = Loader.Ergo.ErgoBoxes.from_boxes_json(unsignedTx.inputs);
    const dataInputBoxes = Loader.Ergo.ErgoBoxes.from_boxes_json(unsignedTx.dataInputs);
    const unsignedTxWasm = Loader.Ergo.UnsignedTransaction.from_json(JSONBig.stringify(unsignedTx));
    signedRewardsInputs = await Promise.all(inputIndicesRewards.map(async (rewardInputIdx) => {
      const signedInputWasm = await rewardsWallet.sign_tx_input(rewardInputIdx, signContext, unsignedTxWasm, unspentBoxes, dataInputBoxes);
      return {
        boxId: signedInputWasm.box_id().to_str(),
        spendingProof: JSON.parse(signedInputWasm.spending_proof().to_json())
      } as SignedInput;
    }));
  }

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
    }
  });

  return {
    unsignedTx: {
      ...unsignedTx,
      id: txId,
    },
    inputIndicesA,
    inputIndicesB,
    inputIndicesRewards,
    signedRewardsInputs
  };
}
