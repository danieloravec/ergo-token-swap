import {type NonMandatoryRegisters, SignedTransaction} from '@fleet-sdk/common';
import { config } from '@config';
import {type Amount, type Box, TokenAmount} from '@fleet-sdk/core';
import sequelizeConnection from "@db/config";
import {JSONB, Op, QueryTypes} from "sequelize";
import Reward from "@db/models/rewards";
import JSONBig from "json-bigint";

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

// TODO use id instead of rewardsSessionSecret and differentiante based on type between mint and rewards
// Each reward will be in a separate box
export const getRewardBoxes = async (amount: number, type: "mint" | "reward", reservedSessionSecretOrAddress: string): Promise<Box<Amount>[]> => {
  const maxExpiredReservationTime = new Date();
  maxExpiredReservationTime.setHours(maxExpiredReservationTime.getHours() - config.rewardReservedForHours);
  const t = await sequelizeConnection.transaction();
  let rewardTokenIds = [];
  try {
    const rewards = await Reward.findAll({
      where: {
        [Op.and]: [
          {giveaway_tx_id: null},
          {
            reserved_at: {
              [Op.or]: [
                {[Op.is]: null},
                {[Op.lt]: maxExpiredReservationTime}
              ]
            }
          },
        ]
      },
      order: sequelizeConnection.random(),
      limit: amount,
      raw: true,
      transaction: t
    });
    if (rewards.length < amount) {
      await t.rollback();
      console.log('Not enough rewards available');
      return [];
    }
    rewardTokenIds = rewards.map((reward) => reward.token_id);
    await Reward.update(
      {
        reserved_session_secret_or_address: reservedSessionSecretOrAddress,
        type,
        reserved_at: new Date()
      },
      {
        where: {
          token_id: {
            [Op.in]: rewardTokenIds
          }
        },
        transaction: t
      });
    await t.commit();
  } catch (err) {
    await t.rollback();
    console.error(`Failed to get reward boxes: ${err}\n${JSON.stringify(err)}`);
    return [];
  }

  try {
    return await Promise.all(rewardTokenIds.map(async (tokenId) => {
      const boxResponse = await explorerRequest(`/boxes/unspent/byTokenId/${tokenId}`, 1);
      return boxResponse.items[0];
    }));
  } catch (err) {
    console.error(`Failed to get reward boxes: ${err}\n${JSON.stringify(err)}`);
    return [];
  }
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

export const getCurrentHeight = async () => {
  const creationHeight = (await explorerRequest('/info', 1))?.height;
  if (!creationHeight) {
    throw new Error('Could not get current height');
  }
  return creationHeight;
}

// TODO log body of the fetch and compare with this example (newlines etc)
// curl 'https://graphql.erg.zelcore.io/' \                                                                                                                                      ✔
//   -H 'accept: application/graphql-response+json, application/graphql+json, application/json, text/event-stream, multipart/mixed' \
//   -H 'content-type: application/json' \
//   --data-raw $'{"operationName":"Mutation","query":"mutation Mutation($signedTransaction: SignedTransaction\u0021) {\\n  submitTransaction(signedTransaction: $signedTransaction)\\n}","variables":{"signedTransaction":{"dataInputs":[],"id":"54e347cf8a22b1bc2a30612c3993951de474c3196d59f15bb7b17f27f253dc77","inputs":[{"boxId":"d7d27b051c822eb1dc899e581e32bd37526446258f977e3f8246bcbf6d010b0d","spendingProof":{"extension":{},"proofBytes":"f2ec76f883e9106e0145b8ac6f567e7e2089d75dddec6079574abe212f7f0c89491bdd981fecdeb1e48ffd056b93c97c3c3a0bdf7db1dc8e"}},{"boxId":"7a3c7416c0fb4ad4b87d6dfaab90b74131a764fb8bd2e7b62be2511475286c67","spendingProof":{"extension":{},"proofBytes":"54f2e355c80ee02adab414511aaa5a6861d3908affc1d5da1ab2a9ab9eadea5c84f898b92d9e7ae52d976c066eadcb693d2a82aceeb54538"}},{"boxId":"c590fcf704b84d1677cc033a6e7dee99c7035c2c2f55b5da3f3f254bca696a55","spendingProof":{"extension":{},"proofBytes":"2b9ae7c9799f64a322f89df173367725d9a61bcb46e9bf087b3edb994958f713093f72473557c4b84b293a4de879b7574ca9393ee649b207"}}],"outputs":[{"additionalRegisters":{},"assets":[],"boxId":"2cdda4bd3966e7a89983b7e08118f095d05c08adc064c7d824af4557f68660e5","creationHeight":1082219,"ergoTree":"0008cd023d4d759cb6e556ed39d963ee06b1b2e5c7ebf8ae00181f9a5c287579f641d42e","index":0,"transactionId":"54e347cf8a22b1bc2a30612c3993951de474c3196d59f15bb7b17f27f253dc77","value":"100000000"},{"additionalRegisters":{},"assets":[],"boxId":"141dcfe8ffd4174b2c6bab75256fc39705a58754fd32fcf3469510e15e0e816e","creationHeight":1082219,"ergoTree":"1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304","index":1,"transactionId":"54e347cf8a22b1bc2a30612c3993951de474c3196d59f15bb7b17f27f253dc77","value":"1100000"},{"additionalRegisters":{},"assets":[{"amount":"1","tokenId":"536a2346778dd129d65e0edf5fefe63116644c5d4512c539e20e4fea6554f33b"},{"amount":"1","tokenId":"a781688ca180d614171f9f34ab6e4a0cf0c402e4c7744b34c27906581f93bfaf"},{"amount":"1","tokenId":"70f7a5e08540424304c83618e5fecefcfbc0fc8dc7544e9a69feedf5d99b48ef"},{"amount":"6904","tokenId":"fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40"},{"amount":"705647953882","tokenId":"30974274078845f263b4f21787e33cc99e9ec19a17ad85a5bc6da2cca91c5a2e"},{"amount":"1","tokenId":"747d76efd075d9c406f44082359284f51bd8806a7bd346a4cef7ab99f1c3a84a"},{"amount":"1","tokenId":"c22823a2f1e4879d36f494ad8cd2be8ce5a2e0d85f36934c33b759f2328e932a"},{"amount":"943499952","tokenId":"1c51c3a53abfe87e6db9a03c649e8360f255ffc4bd34303d30fc7db23ae551db"},{"amount":"3500","tokenId":"e91cbc48016eb390f8f872aa2962772863e2e840708517d1ab85e57451f91bed"},{"amount":"1045314192","tokenId":"e249780a22e14279357103749102d0a7033e0459d10b7f277356522ae9df779c"},{"amount":"4","tokenId":"36aba4b4a97b65be491cf9f5ca57b5408b0da8d0194f30ec8330d1e8946161c1"},{"amount":"16358673780379","tokenId":"ef802b475c06189fdbf844153cdc1d449a5ba87cce13d11bb47b5a539f27f12b"},{"amount":"6000","tokenId":"0779ec04f2fae64e87418a1ad917639d4668f78484f45df962b0dec14a2591d2"},{"amount":"1","tokenId":"4a1d257931b71dc79b5bd5e4d2d3800795e565dff3c6fc9772d8df12379f0925"}],"boxId":"1cc34d621c1a46b2656e742ae6a77cb98ec8458c2557977520b5f376ee32a6a9","creationHeight":1082219,"ergoTree":"0008cd023d4d759cb6e556ed39d963ee06b1b2e5c7ebf8ae00181f9a5c287579f641d42e","index":2,"transactionId":"54e347cf8a22b1bc2a30612c3993951de474c3196d59f15bb7b17f27f253dc77","value":"1374305535"}]}}}' \
//   --compressed

// {"operationName":"Mutation","query":"mutation Mutation($signedTransaction: SignedTransaction!) {\n        submitTransaction(signedTransaction: $signedTransaction)\n      }","variables":{"signedTransaction":{"inputs":[{"boxId":"f5d3c586315855294a1d8e2af832c726f2536cdac34ea038e9690b492f094e84","spendingProof":{"proofBytes":"1ffade2682c44403fe891027c380f2fe4fd3017cc61015905a095866c1780eb78da0c5c8c5615b28b6afa873950dca8ddd5494c72aea4a21","extension":{}}},{"boxId":"365d8697733a638d95ab9bf977a77abd020780b94cb2aac0e1b0367c68baf7cf","spendingProof":{"proofBytes":"61260e6daea9ed7cfdec1b1bc60fd932a3167ea1129d1cc5aff783d1bd170dd890bd0e6fb0cb6e546cdcf553d0766773363f40752b4ef9f7","extension":{}}}],"dataInputs":[],"outputs":[{"value":"200000000","ergoTree":"0008cd03237c93053c6c16a6feabc60a02fbb7201c53ae11f8f3e538aaf0e94e7fee0f66","creationHeight":1082437,"assets":[],"additionalRegisters":{},"boxId":"d9b387ca80eeee99a3f8594b2ffde1b1a7fd5860699dedcb97b2958a0a0fc572","transactionId":"15f37d4f58a4361cc8549b700c1b84437d5c87fe93f59e1c65920d9edebc5850","index":0},{"value":"1000000","ergoTree":"0008cd03b44bf6ef3318eaa4b9ebb164d69afe2e9b36f4b322bb24211e0aa6172a963df1","creationHeight":1082437,"assets":[{"tokenId":"536a2346778dd129d65e0edf5fefe63116644c5d4512c539e20e4fea6554f33b","amount":"1"}],"additionalRegisters":{},"boxId":"def20f8f8aeb08f1ff62494b6d15231ef615cbacab3bd342beb9205a0fa3cd49","transactionId":"15f37d4f58a4361cc8549b700c1b84437d5c87fe93f59e1c65920d9edebc5850","index":1},{"value":"1100000","ergoTree":"1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304","creationHeight":1082437,"assets":[],"additionalRegisters":{},"boxId":"36b7bfdac34b81df79f865416b281e73942fe55b2628be82544bcc390b84c5a7","transactionId":"15f37d4f58a4361cc8549b700c1b84437d5c87fe93f59e1c65920d9edebc5850","index":2},{"value":"353096106619","ergoTree":"0008cd03b44bf6ef3318eaa4b9ebb164d69afe2e9b36f4b322bb24211e0aa6172a963df1","creationHeight":1082437,"assets":[{"tokenId":"b6bde800cf80f1201d22d938ded5a7c47ec389427f49b20e0099b75cfb5cb403","amount":"1"},{"tokenId":"b73c878028fa93d01fc20812ec6e7333e9a501b93cbcc9dd204cb4fa2fe00280","amount":"1"},{"tokenId":"0779ec04f2fae64e87418a1ad917639d4668f78484f45df962b0dec14a2591d2","amount":"3219"},{"tokenId":"fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40","amount":"906"},{"tokenId":"fcfca7654fb0da57ecf9a3f489bcbeb1d43b56dce7e73b352f7bc6f2561d2a1b","amount":"497510000"},{"tokenId":"d1d2ae2ac0456aa43550dd4fda45e4f866d523be9170d3a3e4cab43a83926334","amount":"3138"},{"tokenId":"01dce8a5632d19799950ff90bca3b5d0ca3ebfa8aaafd06f0cc6dd1e97150e7f","amount":"9995601"},{"tokenId":"9a06d9e545a41fd51eeffc5e20d818073bf820c635e2a9d922269913e0de369d","amount":"1030000000"},{"tokenId":"e91cbc48016eb390f8f872aa2962772863e2e840708517d1ab85e57451f91bed","amount":"72"},{"tokenId":"7c6956183bee95b2b989eb6fb35219999af45902465f451d88e2ef56baecc7ca","amount":"1"},{"tokenId":"4f3e6736dfa5bd7d4e08454177fdb7ec455f9d93059a3a76cdd2df52e0ade602","amount":"1"},{"tokenId":"ba553573f83c61be880d79db0f4068177fa75ab7c250ce3543f7e7aeb471a9d2","amount":"15879"},{"tokenId":"f0da9c64261f46a6e5c9835428e87e47c788ae4406740be152f02143eac07153","amount":"1"},{"tokenId":"089990451bb430f05a85f4ef3bcb6ebf852b3d6ee68d86d78658b9ccef20074f","amount":"314926498"},{"tokenId":"30974274078845f263b4f21787e33cc99e9ec19a17ad85a5bc6da2cca91c5a2e","amount":"7950000000"},{"tokenId":"36aba4b4a97b65be491cf9f5ca57b5408b0da8d0194f30ec8330d1e8946161c1","amount":"2"},{"tokenId":"91289d5cefb9d78e3ea248d4e9c5b0e3c3de54f64bfae85c0070580961995262","amount":"3200"},{"tokenId":"ea7a9b52c8f0a9d2a6396e74802793437788693a79e20e52c814ec074c6bb780","amount":"1"},{"tokenId":"d71693c49a84fbbecd4908c94813b46514b18b67a99952dc1e6e4791556de413","amount":"32000"},{"tokenId":"65cce3c123ff22cc4bab8d3dcb250e45c34461b721eaf164717dadc15c53705b","amount":"1"}],"additionalRegisters":{},"boxId":"63403c5c6d4a6f982391069e3178ae2d827ef599d6bbe6b91d5f9e3b5e3e6106","transactionId":"15f37d4f58a4361cc8549b700c1b84437d5c87fe93f59e1c65920d9edebc5850","index":3}],"id":"15f37d4f58a4361cc8549b700c1b84437d5c87fe93f59e1c65920d9edebc5850"}}}
export const submitTx = async (signedTx: SignedTransaction): Promise<{status: number, message: string}> => {
  const body = JSONBig.stringify({
    operationName: "Mutation",
    query: `mutation Mutation($signedTransaction: SignedTransaction!) {
        submitTransaction(signedTransaction: $signedTransaction)
      }`,
    variables: {
      signedTransaction: signedTx
    }
  });
  console.log('ABC');
  const submitResult = await fetch(config.graphQlZelcoreUrl, {
    method: "POST",
    // credentials: "omit",
    headers: {
      // accept: "application/graphql-response+json, application/graphql+json, application/json, text/event-stream, multipart/mixed",
      "content-type": "application/json",
    },
    body
  });
  console.log('XYZ'); // TODO try this now, it should work. You were reading .json() twice, which is probably impossible. Just send Peacetime and Release back and try to mint again.
  const submitData = await submitResult.json();

  if (submitData?.errors !== undefined) {
    return {
      status: 500,
      message: JSON.stringify(submitData.errors)
    }
  }

  const txId = submitData?.data?.submitTransaction;
  console.log(`\n\nSUBMITTED TX ID: ${txId}`);
  return {
    status: 200,
    message: txId
  };
}