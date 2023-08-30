import Router from 'express';
import * as utils from "@utils";
import * as types from "@types";
import {SignedInput} from "@fleet-sdk/common";
import TradingSession from "@db/models/trading_session";
import {buildUnsignedMultisigSwapTx} from "@ergo/transactions";
import {config} from "@config";
import Reward from "@db/models/rewards";

const txRouter = Router();

// Build an unsigned transaction with possibly signed reward inputs
txRouter.post('/', async (req, res) => {
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
          reserved_session_secret: body.secret
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

export default txRouter;