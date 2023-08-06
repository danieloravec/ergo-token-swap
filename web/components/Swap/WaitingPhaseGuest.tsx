import styled from 'styled-components';
import React, { useEffect, useState } from 'react';
import { backendRequest } from '@utils/utils';
import {
  type EIP12UnsignedTransaction,
  type SignedInput,
  type SignedTransaction,
} from '@fleet-sdk/common';
import { type Wallet } from '@ergo/wallet';
import { type Amount, type Box } from '@fleet-sdk/core';
import { combineSignedInputs, fetchFinishedTxId } from '@components/Swap/utils';
import { TradingSessionFinished } from '@components/Swap/TradingSessionFinished';
import { type FungibleToken, type Nft } from '@components/Swap/types';
import { ConfirmTxModal } from '@components/Swap/ConfirmTxModal';
import WaitingScreen from '@components/Swap/WaitingScreen';

const WaitingPhaseHostContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  min-height: 80vh;
  flex-direction: column;
  align-content: center;
  background: ${(props) => props.theme.properties.colorBg};
`;

export function WaitingPhaseGuest(props: {
  tradingSessionId: string;
  wallet: Wallet;
}): JSX.Element {
  const [unsignedTx, setUnsignedTx] = useState<
    EIP12UnsignedTransaction | undefined
  >(undefined);
  const [inputIndicesHost, setInputIndicesHost] = useState<
    number[] | undefined
  >(undefined);
  const [inputIndicesGuest, setInputIndicesGuest] = useState<
    number[] | undefined
  >(undefined);
  const [signedInputsHost, setSignedInputsHost] = useState<
    SignedInput[] | undefined
  >(undefined);
  const [submittedTxId, setSubmittedTxId] = useState<string | undefined>(
    undefined
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [nftsForA, setnftsForA] = useState<Nft[] | undefined>(undefined);
  const [nftsForB, setnftsForB] = useState<Nft[] | undefined>(undefined);
  const [fungibleTokensForA, setfungibleTokensForA] = useState<
    FungibleToken[] | undefined
  >(undefined);
  const [fungibleTokensForB, setfungibleTokensForB] = useState<
    FungibleToken[] | undefined
  >(undefined);
  const [nanoErgForA, setnanoErgForA] = useState<bigint | undefined>(undefined);
  const [nanoErgForB, setnanoErgForB] = useState<bigint | undefined>(undefined);
  const [modalAgreed, setModalAgreed] = useState(false);
  const [ownAddress, setOwnAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fillOwnAddress = async (): Promise<void> => {
      const address = await props.wallet.getAddress();
      setOwnAddress(address);
    };
    fillOwnAddress().catch(console.error);
  });

  useEffect(() => {
    const fetchIsFinished = async (): Promise<void> => {
      const maybeTxId = await fetchFinishedTxId(props.tradingSessionId);
      setSubmittedTxId(maybeTxId);
      setIsLoaded(true);
    };
    fetchIsFinished().catch(console.error);
  });

  useEffect(() => {
    const fetchPartialTxInfo = async (): Promise<void> => {
      if (!isLoaded || unsignedTx !== undefined) {
        return;
      }
      const partialTxResponse = await backendRequest(
        `/tx/partial?secret=${props.tradingSessionId}`
      );
      if (partialTxResponse.status !== 200) {
        console.error('Failed to get partial tx info');
      }
      setUnsignedTx(partialTxResponse?.body?.unsignedTx);
      setInputIndicesHost(partialTxResponse?.body?.inputIndicesHost);
      setInputIndicesGuest(partialTxResponse?.body?.inputIndicesGuest);
      setSignedInputsHost(partialTxResponse?.body?.signedInputsHost);
      setnftsForA(partialTxResponse?.body?.nftsForA);
      setnftsForB(partialTxResponse?.body?.nftsForB);
      setfungibleTokensForA(partialTxResponse?.body?.fungibleTokensForA);
      setfungibleTokensForB(partialTxResponse?.body?.fungibleTokensForB);
      setnanoErgForA(BigInt(partialTxResponse?.body?.nanoErgForA ?? 0));
      setnanoErgForB(BigInt(partialTxResponse?.body?.nanoErgForB ?? 0));
    };
    fetchPartialTxInfo().catch(console.error);
    const interval = setInterval(() => {
      fetchPartialTxInfo().catch(console.error);
    }, 3000);
    return () => {
      clearInterval(interval);
    };
  }, [isLoaded, unsignedTx]);

  useEffect(() => {
    if (
      unsignedTx === undefined ||
      signedInputsHost === undefined ||
      inputIndicesHost === undefined ||
      inputIndicesGuest === undefined ||
      !modalAgreed
    ) {
      return;
    }
    const finalizeGuestSigningAndSubmit = async (): Promise<void> => {
      if (submittedTxId !== undefined) {
        return;
      }
      if (unsignedTx.id === undefined) {
        throw new Error('txId is undefined');
      }
      const signedGuestInputs = await props.wallet.signTxInputs(
        unsignedTx,
        inputIndicesGuest
      );
      const signedInputs = combineSignedInputs(
        signedInputsHost,
        signedGuestInputs,
        inputIndicesHost,
        inputIndicesGuest
      );
      const txId = unsignedTx.id;
      const signedTx: SignedTransaction = {
        id: txId,
        inputs: signedInputs,
        dataInputs: [],
        outputs: unsignedTx.outputs.map((output, i) => {
          if (output.boxId === undefined) {
            throw new Error('boxId is undefined');
          }
          const box: Box<Amount> = {
            ...output,
            boxId: output.boxId,
            transactionId: txId,
            index: i,
          };
          return box;
        }),
      };

      await props.wallet.submitTx(signedTx);

      try {
        await backendRequest(`/tx/register`, 'POST', {
          secret: props.tradingSessionId,
          txId: signedTx.id,
        });
        setSubmittedTxId(signedTx.id);
      } catch (err) {
        console.error(err);
      }
    };
    finalizeGuestSigningAndSubmit().catch(console.error);
  }, [unsignedTx, modalAgreed]);

  if (submittedTxId !== undefined) {
    return <TradingSessionFinished txId={submittedTxId} />;
  }

  return (
    <WaitingPhaseHostContainer>
      {unsignedTx?.id !== undefined &&
      ownAddress !== undefined &&
      nftsForA !== undefined &&
      nftsForB !== undefined &&
      fungibleTokensForA !== undefined &&
      fungibleTokensForB !== undefined &&
      nanoErgForA !== undefined &&
      nanoErgForB !== undefined &&
      !modalAgreed ? (
        <ConfirmTxModal
          nftsForA={nftsForA}
          nftsForB={nftsForB}
          fungibleTokensForA={fungibleTokensForA}
          fungibleTokensForB={fungibleTokensForB}
          nanoErgForA={nanoErgForA}
          nanoErgForB={nanoErgForB}
          onAgree={() => {
            setModalAgreed(true);
          }}
          tradingSessionId={props.tradingSessionId}
        />
      ) : (
        <WaitingScreen tradingSessionId={props.tradingSessionId} />
      )}
    </WaitingPhaseHostContainer>
  );
}
