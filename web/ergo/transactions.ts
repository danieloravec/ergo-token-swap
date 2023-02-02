import {
  OutputBuilder,
  TransactionBuilder,
  type Box,
  type Amount,
} from '@fleet-sdk/core';
import { type Wallet as DappWallet } from '@ergo/wallet';
import { config } from '@config';
// import {
//   SecretKey,
//   BlockHeaders,
//   ErgoBox,
//   Contract,
//   BoxValue,
//   I64,
//   TxId,
//   Tokens,
//   Address,
//   ErgoBoxes,
//   ErgoBoxCandidateBuilder,
//   ErgoBoxCandidates,
//   TxBuilder,
//   SimpleBoxSelector,
//   ErgoStateContext,
//   PreHeader,
//   SecretKeys,
//   Wallet
// } from '@ergoplatform/ergo-lib-wasm';
// import * as wasm from 'ergo-lib-wasm-nodejs';
// const wasm = await import("ergo-lib-wasm-browser");
import { Loader } from '@ergo/loader';

export async function explorerRequest(endpoint: string): Promise<any> {
  const res = await fetch(`${config.blockchainApiUrl}${endpoint}`);
  return await res.json();
}

export async function nodeRequest(endpoint: string): Promise<any> {
  const res = await fetch(`${config.nodeApiUrl}${endpoint}`);
  return await res.json();
}

export async function buildTxExample(wallet: DappWallet): Promise<void> {
  const address = await wallet.getAddress();
  const inputsResponse = await explorerRequest(
    `/transactions/boxes/byAddress/unspent/${address}`
  );

  const creationHeight = await wallet.getCurrentHeight();
  const inputs: Array<Box<Amount>> = inputsResponse.map((input: any) => {
    return {
      ergoTree: input.ergoTree,
      creationHeight: input.creationHeight,
      value: String(input.value),
      assets: input.assets,
      additionalRegisters: input.additionalRegisters,
      boxId: input.id,
      transactionId: input.txId,
      index: input.index,
    };
  });

  const unsignedTransaction = new TransactionBuilder(creationHeight)
    .from(inputs)
    .to(
      new OutputBuilder(
        BigInt(100000000),
        '9ez4QZZnrhRnXcFa4xupxtSU1cnkq7FaGPbRx2ygxe6ZGg5wBLR'
      )
    )
    .sendChangeTo(address)
    .payMinFee()
    .build('EIP-12');

  const signedTransaction = await wallet.signTx(unsignedTransaction);

  const txId = await wallet.submitTx(signedTransaction);
  console.log(`txId: ${txId}`);
}

/* eslint-disable */
export async function buildTxWasmExample(
  dappWallet: DappWallet
): Promise<void> {
  await Loader.load();
  const alice_secret = Loader.Ergo.SecretKey.dlog_from_bytes(
    Uint8Array.from(
      Buffer.from(
        'e726ad60a073a49f7851f4d11a83de6c9c7f99e17314fcce560f00a51a8a3d18',
        'hex'
      )
    )
  );
  const bob_secret = Loader.Ergo.SecretKey.dlog_from_bytes(
    Uint8Array.from(
      Buffer.from(
        '9e6616b4e44818d21b8dfdd5ea87eb822480e7856ab910d00f5834dc64db79b3',
        'hex'
      )
    )
  );
  const alice_pk_bytes = Uint8Array.from(
    Buffer.from(
      'cd03c8e1527efae4be9868cea6767157fcccac66489842738efed0a302e4f81710d0',
      'hex'
    )
  );
  const bob_pk_bytes = Uint8Array.from(
    Buffer.from(
      'cd0247eb7cf009addc51892932c05c2a237c86c92f4982307a1af240a08c88270348',
      'hex'
    )
  );
  // Pay 2 Script address of a multi_sig contract with contract { alicePK && bobPK }
  const multi_sig_address = Loader.Ergo.Address.from_testnet_str(
    'JryiCXrc7x5D8AhS9DYX1TDzW5C5mT6QyTMQaptF76EQkM15cetxtYKq3u6LymLZLVCyjtgbTKFcfuuX9LLi49Ec5m2p6cwsg5NyEsCQ7na83yEPN'
  );
  const input_contract = Loader.Ergo.Contract.pay_to_address(multi_sig_address);
  const input_box = new Loader.Ergo.ErgoBox(
    Loader.Ergo.BoxValue.from_i64(Loader.Ergo.I64.from_str('1000000000')),
    0,
    input_contract,
    Loader.Ergo.TxId.zero(),
    0,
    new Loader.Ergo.Tokens()
  );
  // create a transaction that spends the "simulated" box
  const recipient = Loader.Ergo.Address.from_testnet_str(
    '3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN'
  );
  const unspent_boxes = new Loader.Ergo.ErgoBoxes(input_box);
  const contract = Loader.Ergo.Contract.pay_to_address(recipient);
  const outbox_value = Loader.Ergo.BoxValue.SAFE_USER_MIN();
  const outbox = new Loader.Ergo.ErgoBoxCandidateBuilder(
    outbox_value,
    contract,
    0
  ).build();
  const tx_outputs = new Loader.Ergo.ErgoBoxCandidates(outbox);
  const fee = Loader.Ergo.TxBuilder.SUGGESTED_TX_FEE();
  const change_address = Loader.Ergo.Address.from_testnet_str(
    '3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN'
  );
  const box_selector = new Loader.Ergo.SimpleBoxSelector();
  const target_balance = Loader.Ergo.BoxValue.from_i64(
    outbox_value.as_i64().checked_add(fee.as_i64())
  );
  const box_selection = box_selector.select(
    unspent_boxes,
    target_balance,
    new Loader.Ergo.Tokens()
  );
  const tx_builder = Loader.Ergo.TxBuilder.new(
    box_selection,
    tx_outputs,
    0,
    fee,
    change_address
  );
  const tx = tx_builder.build();
  const tx_data_inputs = Loader.Ergo.ErgoBoxes.from_boxes_json([]);
  const blockHeadersResponse = await nodeRequest(`/blocks/lastHeaders/10`);
  const block_headers =
    Loader.Ergo.BlockHeaders.from_json(blockHeadersResponse);
  const pre_header = Loader.Ergo.PreHeader.from_block_header(
    block_headers.get(0)
  );
  const ctx = new Loader.Ergo.ErgoStateContext(pre_header, block_headers);
  const sks_alice = new Loader.Ergo.SecretKeys();
  sks_alice.add(alice_secret);
  const wallet_alice = Loader.Ergo.Wallet.from_secrets(sks_alice);
  const sks_bob = new Loader.Ergo.SecretKeys();
  sks_bob.add(bob_secret);
  const wallet_bob = Loader.Ergo.Wallet.from_secrets(sks_bob);
  const bob_hints = wallet_bob
    .generate_commitments(ctx, tx, unspent_boxes, tx_data_inputs)
    .all_hints_for_input(0);
  const bob_known = bob_hints.get(0);
  const bob_own = bob_hints.get(1);
  let hints_bag = Loader.Ergo.HintsBag.empty();
  hints_bag.add_commitment(bob_known);
  const alice_tx_hints_bag = Loader.Ergo.TransactionHintsBag.empty();
  alice_tx_hints_bag.add_hints_for_input(0, hints_bag);
  const partial_signed = wallet_alice.sign_transaction_multi(
    ctx,
    tx,
    unspent_boxes,
    tx_data_inputs,
    alice_tx_hints_bag
  );
  const real_propositions = new Loader.Ergo.Propositions();
  const simulated_proposition = new Loader.Ergo.Propositions();
  real_propositions.add_proposition_from_byte(alice_pk_bytes);
  const bob_hints_bag = Loader.Ergo.extract_hints(
    partial_signed,
    ctx,
    unspent_boxes,
    tx_data_inputs,
    real_propositions,
    simulated_proposition
  ).all_hints_for_input(0);
  bob_hints_bag.add_commitment(bob_own);
  const bob_tx_hints_bag = Loader.Ergo.TransactionHintsBag.empty();
  bob_tx_hints_bag.add_hints_for_input(0, bob_hints_bag);
  const signed_tx = wallet_bob.sign_transaction_multi(
    ctx,
    tx,
    unspent_boxes,
    tx_data_inputs,
    bob_tx_hints_bag
  );
  console.log(`signed tx: ${signed_tx.to_json()}`);
}
/* eslint-enable */
