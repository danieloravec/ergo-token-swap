import { buildUnsignedMultisigSwapTx } from '@ergo/transactions';
import { backendRequest, jsonStringifyBig } from '@utils/utils';
import { Button } from '@components/Common/Button';
import { useEffect, useState } from 'react';
import {
  type FungibleToken,
  type Nft,
  type ParticipantInfo,
} from '@components/Swap/types';
import { type Wallet } from '@ergo/wallet';

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
        txPartialInfoResponse?.body?.unsignedTx !== undefined
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
          const { unsignedTx, inputIndicesA, inputIndicesB } =
            await buildUnsignedMultisigSwapTx({
              wallet: props.wallet,
              addressA: props.hostInfo.address,
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

          const body = {
            secret: props.tradingSessionId,
            unsignedTx,
            signedInputsHost: signedInputsA,
            inputIndicesHost: inputIndicesA,
            inputIndicesGuest: inputIndicesB,
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
          console.log(`body: ${JSON.stringify(body)}`);
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
