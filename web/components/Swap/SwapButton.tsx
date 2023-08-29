import { backendRequest, jsonStringifyBig } from '@utils/utils';
import { Button } from '@components/Common/Button';
import { useEffect, useState } from 'react';
import {
  type FungibleToken,
  type Nft,
  type ParticipantInfo,
} from '@components/Swap/types';
import { type Wallet } from '@ergo/wallet';
import { type UnsignedTransaction } from '@fleet-sdk/common';

export const SwapButton = (props: {
  tradingSessionId: string;
  wallet: Wallet;
  hostInfo: ParticipantInfo;
  guestInfo: ParticipantInfo;
  selectedNftsA: Record<string, bigint>;
  selectedNftsADetails: Nft[];
  selectedFungibleTokensA: Record<string, bigint>;
  selectedFungibleTokensADetails: FungibleToken[];
  selectedNanoErgA: bigint;
  selectedNftsB: Record<string, bigint>;
  selectedNftsBDetails: Nft[];
  selectedFungibleTokensB: Record<string, bigint>;
  selectedFungibleTokensBDetails: FungibleToken[];
  selectedNanoErgB: bigint;
  notifyAwaitingGuestSignature: (isAwaiting: boolean) => void;
  setTxId: (txId: string) => void;
}): JSX.Element => {
  const [isWaitingForGuestSignature, setIsWaitingForGuestSignature] =
    useState(false);
  const [isWaitingForHostSignature, setIsWaitingForHostSignature] =
    useState(false);
  const [pollForSubmittedrTxId, setPollForSubmittedTxId] = useState(false);

  useEffect(() => {
    const fetchPartialTxInfo = async (): Promise<void> => {
      if (isWaitingForGuestSignature) {
        props.notifyAwaitingGuestSignature(true);
        return;
      }
      const txPartialInfoResponse = await backendRequest(
        `/tx/partial?secret=${props.tradingSessionId}`
      );
      if (
        txPartialInfoResponse.status === 200 &&
        Boolean(txPartialInfoResponse?.body?.signedInputsHost)
      ) {
        setIsWaitingForGuestSignature(true);
      }
    };
    fetchPartialTxInfo().catch(console.error);
    const interval = setInterval(() => {
      fetchPartialTxInfo().catch(console.error);
    }, 3000);
    return () => {
      clearInterval(interval);
    };
  });

  useEffect(() => {
    const fetchSubmittedTxId = async (): Promise<void> => {
      if (!pollForSubmittedrTxId) {
        return;
      }
      const txResponse = await backendRequest(
        `/tx?secret=${props.tradingSessionId}`
      );
      if (txResponse.status !== 200) {
        throw new Error('Failed to get tx');
      }
      if (txResponse.body.submitted === true) {
        setPollForSubmittedTxId(false);
        props.setTxId(txResponse.body.txId);
      }
    };
    fetchSubmittedTxId().catch(console.error);
    const interval = setInterval(() => {
      fetchSubmittedTxId().catch(console.error);
    }, 3000);
    return () => {
      clearInterval(interval);
    };
  });

  return (
    <Button
      disabled={isWaitingForGuestSignature || isWaitingForHostSignature}
      onClick={() => {
        (async () => {
          setIsWaitingForHostSignature(true);
          const { status, body: txInfo } = await backendRequest('/tx', 'POST', {
            secret: props.tradingSessionId,
            assetsToReceiveByAFromB: {
              ...props.selectedNftsB,
              ...props.selectedFungibleTokensB,
            },
            assetsToReceiveByBFromA: {
              ...props.selectedNftsA,
              ...props.selectedFungibleTokensA,
            },
            nanoErgToReceiveByAFromB: props.selectedNanoErgB,
            nanoErgToReceiveByBFromA: props.selectedNanoErgA,
          });
          if (status !== 200) {
            throw new Error('Failed to create tx');
          }
          const { unsignedTx, inputIndicesA } = txInfo as {
            unsignedTx: UnsignedTransaction;
            inputIndicesA: number[];
          };

          const signedInputsA = await props.wallet.signTxInputs(
            unsignedTx,
            inputIndicesA
          );

          const body = {
            secret: props.tradingSessionId,
            signedInputsHost: signedInputsA,
            nftsForA: JSON.parse(jsonStringifyBig(props.selectedNftsADetails)),
            nftsForB: JSON.parse(jsonStringifyBig(props.selectedNftsBDetails)),
            fungibleTokensForA: JSON.parse(
              jsonStringifyBig(props.selectedFungibleTokensADetails)
            ),
            fungibleTokensForB: JSON.parse(
              jsonStringifyBig(props.selectedFungibleTokensBDetails)
            ),
            nanoErgForA: props.selectedNanoErgA.toString(),
            nanoErgForB: props.selectedNanoErgB.toString(),
          };
          // Register the partial tx
          const txPartialRegisterResponse = await backendRequest(
            '/tx/partial/register',
            'POST',
            body
          );
          if (txPartialRegisterResponse.status !== 200) {
            throw new Error('Failed to register partial tx');
          }

          setIsWaitingForHostSignature(false);
          setPollForSubmittedTxId(true);
        })()
          .then(() => {
            setIsWaitingForGuestSignature(true);
            props.notifyAwaitingGuestSignature(true);
          })
          .catch((err) => {
            console.error(err);
            setIsWaitingForHostSignature(false);
            setIsWaitingForGuestSignature(false);
            props.notifyAwaitingGuestSignature(false);
          });
      }}
    >
      {isWaitingForGuestSignature || isWaitingForHostSignature ? (
        <span>Waiting...</span>
      ) : (
        <span>Swap</span>
      )}
    </Button>
  );
};
