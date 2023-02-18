import { buildUnsignedMultisigSwapTx } from '@ergo/transactions';
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
              assetsToReceiveByAFromB: {
                ...props.selectedNftsB,
                ...props.selectedFungibleTokensB,
              },
              nanoErgToReceiveByAFromB: props.selectedNanoErgB,
              addressB: props.guestInfo.address,
              assetsToReceiveByBFromA: {
                ...props.selectedNftsA,
                ...props.selectedFungibleTokensA,
              },
              nanoErgToReceiveByBFromA: props.selectedNanoErgA,
            });
          const signedInputsA = await props.wallet.signTxInputs(
            unsignedTx,
            inputIndicesA
          );

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
              `/tx?secret=${props.tradingSessionId}`
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
