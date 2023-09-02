import Router from 'express';
import * as utils from "@utils";
import * as types from "@types";
import {SignedInput, SignedTransaction} from "@fleet-sdk/common";
import TradingSession from "@db/models/trading_session";
import {buildMintTx, buildUnsignedMultisigSwapTx} from "@ergo/transactions";
import {config} from "@config";
import Reward from "@db/models/rewards";
import JSONBig from "json-bigint";
import {submitTx} from "@ergo/utils";

const txRouter = Router();

// Build an unsigned transaction with possibly signed reward inputs
txRouter.post('/', async (req, res) => {
  try {
    const body: {
      secret: string;
      assetsToReceiveByAFromB: Record<string, bigint>;
      assetsToReceiveByBFromA: Record<string, bigint>;
      nanoErgToReceiveByAFromB: bigint;
      nanoErgToReceiveByBFromA: bigint;
    } = req.body;

    const {status, result} = await utils.getSessionByReq(req);
    const tradingSession = status === 200 ? result as TradingSession : undefined;
    if (tradingSession === undefined) {
      res.status(status);
      res.send({message: result as string});
      return;
    }

    const {
      unsignedTx,
      inputIndicesA,
      inputIndicesB,
      inputIndicesRewards,
      signedRewardsInputs
    } = await buildUnsignedMultisigSwapTx({
      addressA: tradingSession.host_addr,
      assetsToReceiveByAFromB: body.assetsToReceiveByAFromB,
      nanoErgToReceiveByAFromB: body.nanoErgToReceiveByAFromB,
      addressB: tradingSession.guest_addr,
      assetsToReceiveByBFromA: body.assetsToReceiveByBFromA,
      nanoErgToReceiveByBFromA: body.nanoErgToReceiveByBFromA,
      addRewards: config.rewardsCampaignEnabled,
      rewardsSessionSecret: body.secret,
    });

    const {status: updateStatus, message: updateMessage} = await utils.updateSession(body.secret, {
      ...tradingSession,
      unsigned_tx: unsignedTx,
      unsigned_tx_added_on: new Date(),
      tx_input_indices_host: inputIndicesA,
      tx_input_indices_guest: inputIndicesB,
      input_indices_rewards: inputIndicesRewards,
      signed_rewards_inputs: signedRewardsInputs,
    });
    if (updateStatus !== 200) {
      res.status(updateStatus);
      res.send({message: updateMessage});
      return;
    }

    res.status(200);
    res.send({
      unsignedTx,
      inputIndicesA
    });
  } catch (err) {
    console.error(`Error while building the transaction: ${err} / ${JSONBig.stringify(err)}`);
    res.status(500);
    res.send({message: "Server-side error while building the transaction"});
  }
});

txRouter.post('/partial/register', async (req, res) => {
  try {
    // TODO add validation
    // const bodyIsValid = await utils.validateObject(req.body, types.TxPartialRegisterBodySchema);
    // if(!bodyIsValid) {
    //   res.status(400);
    //   res.send('Invalid body');
    //   return;
    // }
    const body: {
      secret: string,
      signedInputsHost: SignedInput[],
      nftsForA: types.Nft[],
      nftsForB: types.Nft[],
      fungibleTokensForA: types.FungibleToken[],
      fungibleTokensForB: types.FungibleToken[],
      nanoErgForA: bigint,
      nanoErgForB: bigint,
    } = req.body;

    const {status: updateStatus, message: updateMessage} = await utils.updateSession(body.secret, {
      signed_inputs_host: body.signedInputsHost,
      nfts_for_a: body.nftsForA,
      nfts_for_b: body.nftsForB,
      fungible_tokens_for_a: body.fungibleTokensForA,
      fungible_tokens_for_b: body.fungibleTokensForB,
      nano_erg_for_a: body.nanoErgForA,
      nano_erg_for_b: body.nanoErgForB,
    });
    if(updateStatus !== 200) {
      res.status(updateStatus);
      res.send({message: updateMessage});
      return;
    }
    res.status(200);
    res.send({message: "OK"});
  } catch(err) {
    console.error(err.message);
    res.status(500);
    res.send({message: "Server-side error while registering the transaction"});
  }
});

// Returns the unsigned transaction and the input indices of the guest who needs to finalize the signing process
// Returns empty body if the partial transaction is not registered yet
txRouter.get('/partial', async (req, res) => {
  try {
    const {status, result} = await utils.getSessionByReq(req);
    if(status !== 200) {
      res.status(status);
      res.send({message: result as string});
      return;
    }
    const session = result as TradingSession;

    res.status(200);
    if(session.nfts_for_a === null) {
      res.send({});
      return;
    }
    res.send({
      unsignedTx: session.unsigned_tx,
      inputIndicesGuest: session.tx_input_indices_guest,
      inputIndicesHost: session.tx_input_indices_host,
      signedInputsHost: session.signed_inputs_host,
      signedRewardsInputs: session.signed_rewards_inputs, // TODO reflect this line on frontend
      nftsForA: session.nfts_for_a,
      nftsForB: session.nfts_for_b,
      fungibleTokensForA: session.fungible_tokens_for_a,
      fungibleTokensForB: session.fungible_tokens_for_b,
      nanoErgForA: session.nano_erg_for_a,
      nanoErgForB: session.nano_erg_for_b,
    })
  } catch (err) {
    console.error(err.message);
    res.status(500);
    res.send({message: "Server-side error while getting info about the partial transaction"});
  }
});

// Checks if the transaction for a specific session was submitted to the network already
txRouter.get('/', async (req, res) => {
  try {
    const {status, result} = await utils.getSessionByReq(req);
    if(status !== 200) {
      res.status(status);
      res.send({message: result as string});
      return;
    }
    const session = result as TradingSession;
    res.status(200);
    res.send({
      submitted: (session.submitted_at !== null),
      txId: session.tx_id ?? undefined,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500);
    res.send({message: "Server-side error while getting info about the partial transaction"});
  }
});

// TODO move tx submission to BE
txRouter.post('/register', async (req, res) => {
  try {
    const bodyIsValid = await utils.validateObject(req.body, types.TxRegisterBodySchema);
    if(!bodyIsValid) {
      res.status(400);
      res.send({message: 'Invalid body'});
      return;
    }
    const body: {secret: string, txId: string} = req.body;
    const {status, message} = await utils.updateSession(body.secret, {
      submitted_at: new Date(),
      tx_id: body.txId,
    });

    await Reward.update(
      {
        giveaway_tx_id: body.txId,
      },
      {
        where: {
          reserved_session_secret_or_address: body.secret
        }
      }
    )

    await utils.updateStats(body.secret);

    if(status !== 200) {
      res.status(status);
      res.send(message);
      return;
    }
    res.status(200);
    res.send({
      message: "Transaction registered successfully",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500);
    res.send({message: "Server-side error while registering the transaction"});
  }
});

txRouter.post('/mint/build', async (req, res) => {
  try {
    const body: {
      address: string,
      amount: number
    } = req.body;

    if (body?.address === undefined) {
      res.status(400);
      res.send({message: "Missing address"});
    }

    if (body?.amount === undefined || body.amount <= 0 || body.amount > config.maxMintedPerTx) {
      res.status(400);
      res.send({message: "Missing or wrong amount"});
    }

    const mintTxInfo = await buildMintTx(body.address, body.amount);

    res.status(200);
    res.send(mintTxInfo);
  } catch (err) {
    console.error(`Error while minting the token: ${err} / ${JSONBig.stringify(err)}`);
    res.status(500);
    res.send({message: "Server-side error while minting the token"});
  }
});


// fetch("https://graphql.erg.zelcore.io/", {
//   "headers": {
//     "accept": "application/graphql-response+json, application/graphql+json, application/json, text/event-stream, multipart/mixed",
//     "accept-language": "en-US,en;q=0.9,sk;q=0.8",
//     "content-type": "application/json",
//     "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Brave\";v=\"116\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Linux\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "cross-site",
//     "sec-gpc": "1"
//   },
//   "referrerPolicy": "strict-origin-when-cross-origin",
//   "body": "{\"operationName\":\"Mutation\",\"query\":\"mutation Mutation($signedTransaction: SignedTransaction!) {\\n  submitTransaction(signedTransaction: $signedTransaction)\\n}\",\"variables\":{\"signedTransaction\":{\"dataInputs\":[],\"id\":\"54e347cf8a22b1bc2a30612c3993951de474c3196d59f15bb7b17f27f253dc77\",\"inputs\":[{\"boxId\":\"d7d27b051c822eb1dc899e581e32bd37526446258f977e3f8246bcbf6d010b0d\",\"spendingProof\":{\"extension\":{},\"proofBytes\":\"f2ec76f883e9106e0145b8ac6f567e7e2089d75dddec6079574abe212f7f0c89491bdd981fecdeb1e48ffd056b93c97c3c3a0bdf7db1dc8e\"}},{\"boxId\":\"7a3c7416c0fb4ad4b87d6dfaab90b74131a764fb8bd2e7b62be2511475286c67\",\"spendingProof\":{\"extension\":{},\"proofBytes\":\"54f2e355c80ee02adab414511aaa5a6861d3908affc1d5da1ab2a9ab9eadea5c84f898b92d9e7ae52d976c066eadcb693d2a82aceeb54538\"}},{\"boxId\":\"c590fcf704b84d1677cc033a6e7dee99c7035c2c2f55b5da3f3f254bca696a55\",\"spendingProof\":{\"extension\":{},\"proofBytes\":\"2b9ae7c9799f64a322f89df173367725d9a61bcb46e9bf087b3edb994958f713093f72473557c4b84b293a4de879b7574ca9393ee649b207\"}}],\"outputs\":[{\"additionalRegisters\":{},\"assets\":[],\"boxId\":\"2cdda4bd3966e7a89983b7e08118f095d05c08adc064c7d824af4557f68660e5\",\"creationHeight\":1082219,\"ergoTree\":\"0008cd023d4d759cb6e556ed39d963ee06b1b2e5c7ebf8ae00181f9a5c287579f641d42e\",\"index\":0,\"transactionId\":\"54e347cf8a22b1bc2a30612c3993951de474c3196d59f15bb7b17f27f253dc77\",\"value\":\"100000000\"},{\"additionalRegisters\":{},\"assets\":[],\"boxId\":\"141dcfe8ffd4174b2c6bab75256fc39705a58754fd32fcf3469510e15e0e816e\",\"creationHeight\":1082219,\"ergoTree\":\"1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304\",\"index\":1,\"transactionId\":\"54e347cf8a22b1bc2a30612c3993951de474c3196d59f15bb7b17f27f253dc77\",\"value\":\"1100000\"},{\"additionalRegisters\":{},\"assets\":[{\"amount\":\"1\",\"tokenId\":\"536a2346778dd129d65e0edf5fefe63116644c5d4512c539e20e4fea6554f33b\"},{\"amount\":\"1\",\"tokenId\":\"a781688ca180d614171f9f34ab6e4a0cf0c402e4c7744b34c27906581f93bfaf\"},{\"amount\":\"1\",\"tokenId\":\"70f7a5e08540424304c83618e5fecefcfbc0fc8dc7544e9a69feedf5d99b48ef\"},{\"amount\":\"6904\",\"tokenId\":\"fbbaac7337d051c10fc3da0ccb864f4d32d40027551e1c3ea3ce361f39b91e40\"},{\"amount\":\"705647953882\",\"tokenId\":\"30974274078845f263b4f21787e33cc99e9ec19a17ad85a5bc6da2cca91c5a2e\"},{\"amount\":\"1\",\"tokenId\":\"747d76efd075d9c406f44082359284f51bd8806a7bd346a4cef7ab99f1c3a84a\"},{\"amount\":\"1\",\"tokenId\":\"c22823a2f1e4879d36f494ad8cd2be8ce5a2e0d85f36934c33b759f2328e932a\"},{\"amount\":\"943499952\",\"tokenId\":\"1c51c3a53abfe87e6db9a03c649e8360f255ffc4bd34303d30fc7db23ae551db\"},{\"amount\":\"3500\",\"tokenId\":\"e91cbc48016eb390f8f872aa2962772863e2e840708517d1ab85e57451f91bed\"},{\"amount\":\"1045314192\",\"tokenId\":\"e249780a22e14279357103749102d0a7033e0459d10b7f277356522ae9df779c\"},{\"amount\":\"4\",\"tokenId\":\"36aba4b4a97b65be491cf9f5ca57b5408b0da8d0194f30ec8330d1e8946161c1\"},{\"amount\":\"16358673780379\",\"tokenId\":\"ef802b475c06189fdbf844153cdc1d449a5ba87cce13d11bb47b5a539f27f12b\"},{\"amount\":\"6000\",\"tokenId\":\"0779ec04f2fae64e87418a1ad917639d4668f78484f45df962b0dec14a2591d2\"},{\"amount\":\"1\",\"tokenId\":\"4a1d257931b71dc79b5bd5e4d2d3800795e565dff3c6fc9772d8df12379f0925\"}],\"boxId\":\"1cc34d621c1a46b2656e742ae6a77cb98ec8458c2557977520b5f376ee32a6a9\",\"creationHeight\":1082219,\"ergoTree\":\"0008cd023d4d759cb6e556ed39d963ee06b1b2e5c7ebf8ae00181f9a5c287579f641d42e\",\"index\":2,\"transactionId\":\"54e347cf8a22b1bc2a30612c3993951de474c3196d59f15bb7b17f27f253dc77\",\"value\":\"1374305535\"}]}}}",
//   "method": "POST",
//   "mode": "cors",
//   "credentials": "omit"
// });

txRouter.post('/mint/submit', async (req, res) => {
  try {
    const body: {
      type: "mint" | "swap",
      signedTx: SignedTransaction
    } = req.body;

    const {status, message} = await submitTx(body.signedTx);

    if (status !== 200) {
      res.status(status);
      res.send({message});
      return;
    }

    await Reward.update({
      giveaway_tx_submitted_at: new Date(),
    }, {
      where: {
        giveaway_tx_id: txId,
      }
    });

    res.status(status);
    res.send({ message }); // TODO test this
  } catch (err) {
    res.status(500);
    console.error(`Error while submitting minting tx: ${err}`);
    res.send({
      message: `Server-side error while submitting the transaction: ${err} / ${JSONBig.stringify(err)}`
    })
  }
});

export default txRouter;
