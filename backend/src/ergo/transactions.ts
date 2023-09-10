import {Amount, Box, OutputBuilder, TransactionBuilder} from '@fleet-sdk/core';
import { config } from '@config';
import {type EIP12UnsignedTransaction, SignedInput} from '@fleet-sdk/common';
import * as utils from '@ergo/utils';
import { Loader } from '@ergo/loader';
import {explorerRequest} from "@ergo/utils";
import JSONBig from "json-bigint";
import {getRewardBoxes} from "@ergo/utils";

interface BuildMultisigSwapTxParams {
  addressA: string;
  assetsToReceiveByAFromB: Record<string, bigint>;
  nanoErgToReceiveByAFromB: bigint;
  addressB: string;
  assetsToReceiveByBFromA: Record<string, bigint>;
  nanoErgToReceiveByBFromA: bigint;
  addRewards: boolean;
  rewardsSessionSecret: string;
}

const calculateTxId = async (unsignedTx: EIP12UnsignedTransaction): Promise<string> => {
  await Loader.load();
  return Loader.Ergo.UnsignedTransaction.from_json(
    JSONBig.stringify(unsignedTx)
  )
    .id()
    .to_str();
}

const fillBoxIds = async (unsignedTx: EIP12UnsignedTransaction): Promise<string> => {
  const txId = await calculateTxId(unsignedTx);
  unsignedTx.outputs.forEach((output, idx) => {
    unsignedTx.outputs[idx].boxId = Loader.Ergo.ErgoBox.from_json(
      JSONBig.stringify({
        ...output,
        index: idx,
        transactionId: txId,
      })
    )
      .box_id()
      .to_str();
  });
  return txId;
}

const signRewardInputs = async (unsignedTx: EIP12UnsignedTransaction, rewardInputIndices: number[]): Promise<SignedInput[]> => {
  await Loader.load();
  const seed = Loader.Ergo.Mnemonic.to_seed(
    config.rewardsWalletMnemonic,
    config.rewardsWalletPassword
  );
  const extendedSecretKey = Loader.Ergo.ExtSecretKey.derive_master(seed);
  const changePath = Loader.Ergo.DerivationPath.from_string("m/44'/429'/0'/0/0");
  const changeSk = extendedSecretKey.derive(changePath);

  const headers = (await explorerRequest(`/blocks/headers?limit=10`, 1))?.items;
  const blockHeaders = Loader.Ergo.BlockHeaders.from_json(headers);
  const preHeader = Loader.Ergo.PreHeader.from_block_header(blockHeaders.get(0));

  const dlogSecret = Loader.Ergo.SecretKey.dlog_from_bytes(changeSk.secret_key_bytes());
  const secretKeys = new Loader.Ergo.SecretKeys();
  secretKeys.add(dlogSecret);
  const rewardsWallet = Loader.Ergo.Wallet.from_secrets(secretKeys);

  const signContext = new Loader.Ergo.ErgoStateContext(preHeader, blockHeaders);
  const unspentBoxes = Loader.Ergo.ErgoBoxes.from_boxes_json(unsignedTx.inputs);
  const dataInputBoxes = Loader.Ergo.ErgoBoxes.from_boxes_json(unsignedTx.dataInputs);

  const unsignedTxWasm = Loader.Ergo.UnsignedTransaction.from_json(JSONBig.stringify(unsignedTx));
  return await Promise.all(rewardInputIndices.map(async (rewardInputIdx) => {
    const signedInputWasm = await rewardsWallet.sign_tx_input(rewardInputIdx, signContext, unsignedTxWasm, unspentBoxes, dataInputBoxes);
    return {
      boxId: signedInputWasm.box_id().to_str(),
      spendingProof: JSON.parse(signedInputWasm.spending_proof().to_json())
    } as SignedInput;
  }));
};

export async function buildUnsignedMultisigSwapTx({
  addressA,
  assetsToReceiveByAFromB,
  nanoErgToReceiveByAFromB,
  addressB,
  assetsToReceiveByBFromA,
  nanoErgToReceiveByBFromA,
  addRewards = false,
  rewardsSessionSecret = ''
}: BuildMultisigSwapTxParams): Promise<{
  unsignedTx: EIP12UnsignedTransaction;
  inputIndicesA: number[];
  inputIndicesB: number[];
  inputIndicesRewards: number[];
  signedRewardsInputs: SignedInput[];
}> {
  await Loader.load();
  const creationHeight = await utils.getCurrentHeight();

  const rewardInputs = addRewards ? await utils.getRewardBoxes(2, "reward", rewardsSessionSecret) : [];

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
    addRewards && rewardInputs.length > 0 ? utils.getAssetsFromBox(rewardInputs[0]) : {}
  ]);
  const totalAssetsToReceiveByB = utils.mergeAssets([
    assetsToReceiveByBFromA,
    changeAssetsToB,
    addRewards && rewardInputs.length > 0 ? utils.getAssetsFromBox(rewardInputs[1]) : {}
  ]);

  const outputs = [
    new OutputBuilder(
      BigInt(allNanoErgA) +
      BigInt(nanoErgToReceiveByAFromB) -
      BigInt(nanoErgToReceiveByBFromA) -
      BigInt(config.serviceFeeNanoErg) +
      BigInt(config.minNanoErgValue),
      addressA
    ).addTokens([
      ...Object.keys(totalAssetsToReceiveByA).map((tokenId) => ({
        tokenId,
        amount: totalAssetsToReceiveByA[tokenId],
      })),
    ]),
    new OutputBuilder(
      BigInt(allNanoErgB) +
      BigInt(nanoErgToReceiveByBFromA) -
      BigInt(nanoErgToReceiveByAFromB) -
      BigInt(config.serviceFeeNanoErg) +
      BigInt(config.minNanoErgValue),
      addressB
    ).addTokens([
      ...Object.keys(totalAssetsToReceiveByB).map((tokenId) => ({
        tokenId,
        amount: totalAssetsToReceiveByB[tokenId],
      })),
    ]),
  ];

  const unsignedTx = new TransactionBuilder(creationHeight)
    .from([...inputsA, ...inputsB, ...rewardInputs])
    .to(outputs)
    .sendChangeTo(config.serviceFeeAddress) // Only 2 * config.serviceFeeNanoErg will be in change
    .payMinFee()
    .build()
    .toEIP12Object();

  let inputIndicesRewards = [] as number[];
  let signedRewardsInputs = [] as SignedInput[];
  if (addRewards && rewardInputs.length > 0) {
    inputIndicesRewards = unsignedTx.inputs.map((input, idx) => {
      return input.ergoTree === rewardInputs[0].ergoTree ? idx : -1;
    }).filter((idx) => idx !== -1);
    signedRewardsInputs = await signRewardInputs(unsignedTx, inputIndicesRewards);
  }

  const txId = await fillBoxIds(unsignedTx); // TODO does this really modify outputs?

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

interface BuildMintTxResult {
  unsignedTx: EIP12UnsignedTransaction,
  signedMintInputs: SignedInput[],
  inputIndicesMint: number[]
}

export const buildMintTx = async (address: string, amountToMint: number): Promise<BuildMintTxResult> => {
  const mintInputs = await getRewardBoxes(amountToMint, "mint", address);
  if (mintInputs.length === 0) {
    throw new Error('No reward inputs found');
  }

  const userInputs = await utils.getInputs(address);
  if (userInputs.length === 0) {
    throw new Error('No inputs found for at least one of the participants');
  }

  const mintedAssets = mintInputs.map((input) => {
    return input.assets;
  }).flat();
  const outputs = [
    new OutputBuilder(
      BigInt(amountToMint) * config.mintPriceNanoErg,
      config.serviceFeeAddress
    ),
    new OutputBuilder(
      BigInt(amountToMint) * config.minNanoErgValue,
      address
    ).addTokens(mintedAssets)
  ];

  const creationHeight = await utils.getCurrentHeight();

  const unsignedTx = new TransactionBuilder(creationHeight)
    .from([...userInputs, ...mintInputs])
    .to(outputs)
    .sendChangeTo(address) // We only want the fee. All contents of reward inputs go to user (there's 1 NFT per box)
    .payMinFee()
    .build()
    .toEIP12Object();

  const inputIndicesMint = unsignedTx.inputs.map((input, idx) => {
    return input.ergoTree === mintInputs[0].ergoTree ? idx : -1;
  }).filter((idx) => idx !== -1);
  const signedMintInputs = await signRewardInputs(unsignedTx, inputIndicesMint);

  const txId = await fillBoxIds(unsignedTx);

  return {
    unsignedTx: {
      ...unsignedTx,
      id: txId,
    },
    signedMintInputs,
    inputIndicesMint,
  };
}

export const buildAuthTx = async (address: string): Promise<{
  unsignedAuthTx: EIP12UnsignedTransaction,
  boxToValidate: Box<Amount>
}> => {
  const userInputs = await utils.getInputs(address);
  if (userInputs.length === 0) {
    throw new Error('User has to have at least 1 UTxO in the wallet to authenticate');
  }

  const creationHeight = await utils.getCurrentHeight();

  const outputs = [
    new OutputBuilder(
      config.mintPriceNanoErg,
      address
    ),
  ];

  const unsignedTx = new TransactionBuilder(creationHeight)
    .from(userInputs)
    .to(outputs)
    .sendChangeTo(address)
    .payMinFee()
    .build()
    .toEIP12Object();

  const boxToValidate = unsignedTx.inputs[0];

  const txId = await fillBoxIds(unsignedTx);
  return {
    unsignedAuthTx: {
      ...unsignedTx,
      id: txId,
    },
    boxToValidate
  };
}
