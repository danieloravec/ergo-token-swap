import { type NonMandatoryRegisters } from '@fleet-sdk/common';
import { config } from '@config';
import { type Amount, type Box } from '@fleet-sdk/core';

export interface AdditionalRegisterObjectRepr {
  serializedValue: string;
  sigmaType: string;
  renderedValue: string;
}

export type RegisterName = 'R4' | 'R5' | 'R6' | 'R7' | 'R8' | 'R9';

export const parseAdditionalRegisters = (
  additionalRegisters: Record<
    RegisterName,
    AdditionalRegisterObjectRepr | string
  >
): NonMandatoryRegisters => {
  const parsedRegisters: NonMandatoryRegisters = {};
  for (const [key, value] of Object.entries(additionalRegisters)) {
    if (typeof value === 'string') {
      parsedRegisters[key as RegisterName] = value;
    } else {
      parsedRegisters[key as RegisterName] = value.serializedValue;
    }
  }
  return parsedRegisters;
};

export async function explorerRequest(endpoint: string): Promise<any> {
  const res = await fetch(`${config.explorerApiUrl}${endpoint}`);
  return await res.json();
}

export const getInputs = async (
  address: string
): Promise<Array<Box<Amount>>> => {
  const inputsResponse = await explorerRequest(
    `/boxes/unspent/byAddress/${address}`
  );
  return inputsResponse.items.map((input: Box<Amount>) => {
    console.log(`register: ${JSON.stringify(input)}`);
    return {
      ergoTree: input.ergoTree,
      creationHeight: input.creationHeight,
      value: BigInt(input.value),
      assets: input.assets,
      additionalRegisters: parseAdditionalRegisters(
        input.additionalRegisters as Record<
          RegisterName,
          string | AdditionalRegisterObjectRepr
        >
      ),
      boxId: input.boxId,
      transactionId: input.transactionId,
      index: input.index,
    };
  });
};

export const aggregateTokensInfo = (
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

export const aggregateInputsNanoErgValue = (
  inputs: Array<Box<Amount>>
): bigint => {
  return inputs.reduce((acc, input) => acc + BigInt(input.value), BigInt(0));
};
