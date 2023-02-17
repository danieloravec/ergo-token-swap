import { buildUnsignedMultisigSwapTx } from '@ergo/transactions';
import { type SignedInput } from '@fleet-sdk/common';
import { backendRequest } from '@utils/utils';
import { Button } from '@components/Common/Button';
import { useState } from 'react';
import { type ParticipantInfo } from '@components/Swap/types';
import { type Wallet } from '@ergo/wallet';

export const SwapButton = (props: {
  tradingSessionId: string;
  wallet: Wallet;
  creatorInfo: ParticipantInfo;
  guestInfo: ParticipantInfo;
  selectedNftsA: Record<string, bigint>;
  selectedFungibleTokensA: Record<string, bigint>;
  selectedNanoErgA: bigint;
  selectedNftsB: Record<string, bigint>;
  selectedFungibleTokensB: Record<string, bigint>;
  selectedNanoErgB: bigint;
  notifyAwaitingGuestSignature: () => void;
  setTxId: (txId: string) => void;
}): JSX.Element => {
  const [isWaitingForGuestSignature, setIsWaitingForGuestSignature] =
    useState(false);
  return (
    <Button
      disabled={isWaitingForGuestSignature}
      onClick={() => {
        setIsWaitingForGuestSignature(true);
        props.notifyAwaitingGuestSignature();
        (async () => {
          const { unsignedTx, inputIndicesA, inputIndicesB } =
            await buildUnsignedMultisigSwapTx({
              wallet: props.wallet,
              addressA: props.creatorInfo.address,
              assetsToReceiveByA: {
                ...props.selectedNftsB,
                ...props.selectedFungibleTokensB,
              },
              nanoErgToReceiveByA: props.selectedNanoErgB,
              addressB: props.guestInfo.address,
              assetsToReceiveByB: {
                ...props.selectedNftsA,
                ...props.selectedFungibleTokensA,
              },
              nanoErgToReceiveByB: props.selectedNanoErgA,
            });
          // TODO sign unsignedInputsA here instead of just logging
          console.log(`unsignedTx: ${JSON.stringify(unsignedTx)}`);
          console.log(`inputIndicesA: ${JSON.stringify(inputIndicesA)}`);
          console.log(`inputIndicesB: ${JSON.stringify(inputIndicesB)}`);
          // TODO use the commented snipped instead of mocked empty array once sign_tx_inputs is implemented
          const signedInputsA: SignedInput[] = [];
          // const signedInputsA = await props.wallet.sign_tx_inputs(
          //   unsignedTx,
          //   inputIndicesA.map((idx) => unsignedTx.inputs[idx])
          // );

          // Register the partial tx
          const txPartialRegisterResponse = await backendRequest(
            '/tx/partial/register',
            'POST',
            {
              secret: props.tradingSessionId,
              unsignedTx,
              signedInputsCreator: signedInputsA,
              inputIndicesCreator: inputIndicesA,
              inputIndicesGuest: inputIndicesB,
            }
          );
          if (txPartialRegisterResponse.status !== 200) {
            throw new Error('Failed to register partial tx');
          }

          // Poll for /tx/{secret} and wait until the tx is submitted (save the txId to show explorer link)
          let foundTxId: string | undefined;
          while (foundTxId === undefined) {
            const txResponse = await backendRequest(
              `/tx?secret=${props.tradingSessionId}`,
              'GET'
            );
            if (txResponse.status !== 200) {
              throw new Error('Failed to get tx');
            }
            if (txResponse.body.submitted as boolean) {
              foundTxId = txResponse.body.txId;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
          props.setTxId(foundTxId);
        })().catch(console.error);
      }}
    >
      {isWaitingForGuestSignature ? <span>Waiting...</span> : <span>Swap</span>}
    </Button>
  );
};
