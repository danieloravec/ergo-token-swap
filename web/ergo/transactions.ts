import {
  type Amount,
  type Box,
  OutputBuilder,
  TransactionBuilder,
} from '@fleet-sdk/core';
import { type Wallet } from '@ergo/wallet';
import { config } from '@config';
import {
  type EIP12UnsignedTransaction,
} from '@fleet-sdk/common';

interface BuildMultisigSwapTxParams {
  wallet: Wallet;
  addressA: string;
  assetsToReceiveByA: Record<string, bigint>;
  nanoErgToReceiveByA: bigint;
  addressB: string;
  assetsToReceiveByB: Record<string, bigint>;
  nanoErgToReceiveByB: bigint;
}
export async function explorerRequest(endpoint: string): Promise<any> {
  const res = await fetch(`${config.explorerApiUrl}${endpoint}`);
  return await res.json();
}

const getInputs = async (address: string): Promise<Array<Box<Amount>>> => {
  const inputsResponse = await explorerRequest(
    `/boxes/unspent/byAddress/${address}`
  );
  return inputsResponse.items.map((input: Box<Amount>) => {
    return {
      ergoTree: input.ergoTree,
      creationHeight: input.creationHeight,
      value: String(input.value),
      assets: input.assets,
      additionalRegisters: input.additionalRegisters,
      boxId: input.boxId,
      transactionId: input.transactionId,
      index: input.index,
    };
  });
};

const aggregateTokensInfo = (
  inputs: Array<Box<Amount>>
): Record<string, bigint> => {
  const totalAssets: Record<string, bigint> = {};
  for (const input of inputs) {
    for (const asset of input.assets) {
      if (totalAssets[asset.tokenId] === undefined) {
        totalAssets[asset.tokenId] = BigInt(0);
      }
      totalAssets[asset.tokenId] += BigInt(asset.amount);
    }
  }
  return totalAssets;
};

const aggregateInputsNanoErgValue = (inputs: Array<Box<Amount>>): bigint => {
  return inputs.reduce((acc, input) => acc + BigInt(input.value), BigInt(0));
};

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
  const inputsA = await getInputs(addressA);
  const inputsB = await getInputs(addressB);

  if (inputsA.length === 0 || inputsB.length === 0) {
    throw new Error('No inputs found for at least one of the participants');
  }

  const changeToA = aggregateTokensInfo(inputsA); // We'll subtract appropriate value from this later
  const changeToB = aggregateTokensInfo(inputsB);
  for (const tokenId in assetsToReceiveByB) {
    changeToA[tokenId] -= assetsToReceiveByB[tokenId];
  }
  for (const tokenId in assetsToReceiveByA) {
    changeToB[tokenId] -= assetsToReceiveByA[tokenId];
  }
  const nanoErgChangeToA = aggregateInputsNanoErgValue(inputsA);
  const nanoErgChangeToB = aggregateInputsNanoErgValue(inputsB);

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

  return {
    unsignedTx,
    inputIndicesA,
    inputIndicesB,
  };
}

// export async function buildTxExample(wallet: Wallet): Promise<void> {
//   const address = await wallet.getAddress();
//
//   const creationHeight = await wallet.getCurrentHeight();
//   const inputs = await getInputs(address);
//
//   const unsignedTransaction = new TransactionBuilder(creationHeight)
//     .from(inputs)
//     .to(
//       new OutputBuilder(
//         BigInt(100000000),
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
