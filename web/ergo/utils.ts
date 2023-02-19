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

export async function explorerRequest(
  endpoint: string,
  apiVersion: 0 | 1 = 1
): Promise<any> {
  if (!endpoint.startsWith('/')) {
    endpoint = `/${endpoint}`;
  }
  const res = await fetch(`${config.explorerApiUrl}/v${apiVersion}${endpoint}`);
  return await res.json();
}

export const getInputs = async (
  address: string
): Promise<Array<Box<Amount>>> => {
  const inputsResponse = await explorerRequest(
    `/boxes/unspent/byAddress/${address}`
  );
  return inputsResponse.items.map((input: Box<Amount>) => {
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

export const subtractAssets = (
  assets: Record<string, bigint>,
  assetsToSubtract: Record<string, bigint>
): Record<string, bigint> => {
  const assetsCopy = { ...assets };
  for (const tokenId in assetsToSubtract) {
    if (assetsCopy[tokenId] === undefined) {
      throw new Error('Token not available and can not be subtracted');
    }
    assetsCopy[tokenId] -= assetsToSubtract[tokenId];
  }
  return assetsCopy;
};

export const mergeAssets = (
  assetsA: Record<string, bigint>,
  assetsB: Record<string, bigint>
): Record<string, bigint> => {
  const result = { ...assetsA };
  for (const tokenId in assetsB) {
    if (result[tokenId] === undefined) {
      result[tokenId] = BigInt(0);
    }
    result[tokenId] += assetsB[tokenId];
  }
  return result;
};
