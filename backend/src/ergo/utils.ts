import { type NonMandatoryRegisters } from '@fleet-sdk/common';
import { config } from '@config';
import {type Amount, type Box, TokenAmount} from '@fleet-sdk/core';
import sequelizeConnection from "@db/config";
import {QueryTypes} from "sequelize";
import Reward from "@db/models/rewards";

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
  const res = await fetch(`${config.blockchainApiUrl}/v${apiVersion}${endpoint}`);
  return await res.json();
}

export const getInputs = async (
  address: string
): Promise<Box<Amount>[]> => {
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

export const getRewardBoxes = async (amount: number): Promise<Box<Amount>[]> => {
  // TODO get random available token IDs from DB and get boxes for them (each reward NFT will be in a separate box)
  const rewards = await Reward.findAll({
    where: {
      available: true,
    },
    order: [['tokenId', 'DESC']],
    limit: amount,
    raw: true
  });
  console.log(`\n\nrewards: ${JSON.stringify(rewards)}\n\n`);
  const tokenIds = rewards.map((reward) => reward.token_id);
  return await Promise.all(tokenIds.map(async (tokenId) => {
    return (await explorerRequest(`/boxes/unspent/byTokenId/${tokenId}`, 1)) as Box<Amount>;
  }));
};

export const getAssetsFromBox = (box: Box<Amount>): Record<string, bigint> => {
  const result: Record<string, bigint> = {};
  box.assets.forEach((asset: TokenAmount<Amount>) => {
    result[asset.tokenId] = BigInt(asset.amount);
  });
  return result;
}

export const aggregateTokensInfo = (
  inputs: Box<Amount>[]
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
  inputs: Box<Amount>[]
): bigint => {
  return inputs.reduce((acc, input) => acc + BigInt(input.value), BigInt(0));
};

export const subtractAssets = (
  assets: Record<string, bigint>,
  assetsToSubtract: Record<string, bigint>
): Record<string, bigint> => {
  const assetsCopy = { ...assets };
  for (const tokenId of Object.keys(assetsToSubtract)) {
    if (assetsCopy[tokenId] === undefined) {
      throw new Error('Token not available and can not be subtracted');
    }
    assetsCopy[tokenId] -= BigInt(assetsToSubtract[tokenId]);
  }
  for (const tokenId of Object.keys(assetsCopy)) {
    if (assetsCopy[tokenId] <= BigInt(0)) {
      delete assetsCopy[tokenId];
    }
  }
  return assetsCopy;
};

export const mergeAssetsSimple = (
  assetsA: Record<string, bigint>,
  assetsB: Record<string, bigint>
): Record<string, bigint> => {
  const result = { ...assetsA };
  for (const tokenId of Object.keys(assetsB)) {
    if (result[tokenId] === undefined && assetsB[tokenId] > BigInt(0)) {
      result[tokenId] = BigInt(0);
    }
    result[tokenId] += BigInt(assetsB[tokenId]);
  }
  return result;
};

export const mergeAssets = (assetsToMerge: Record<string, bigint>[]): Record<string, bigint> => {
  if (assetsToMerge.length === 0) {
    return {};
  }
  let result = {};
  for (const assets of assetsToMerge) {
    result = mergeAssetsSimple(result, assets);
  }
  return result;
}
