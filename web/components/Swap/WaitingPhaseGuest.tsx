import styled, { useTheme } from 'styled-components';
import {
  Heading1,
  OrderedList,
  TextPrimaryWrapper,
} from '@components/Common/Text';
import { Hourglass } from '@components/Icons/Hourglass';
import React, { useEffect, useState } from 'react';
import {
  CenteredDivHorizontal,
  CenteredDivVertical,
  FlexDiv,
} from '@components/Common/Alignment';
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

const WaitingPhaseHostContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  height: 80vh;
  flex-direction: column;
  align-content: center;
  background: ${(props) => props.theme.properties.colorBg};
`;

function WaitingPhaseGuestGuide(): JSX.Element {
  return (
    <FlexDiv>
      <OrderedList>
        <li>Wait for the other party to select assets to swap.</li>
        <li>A wallet prompt will show up.</li>
        <li>Make sure the swap is fair.</li>
        <li>If it is, sign the transaction.</li>
      </OrderedList>
    </FlexDiv>
  );
}

export function WaitingPhaseGuest(props: {
  tradingSessionId: string;
  wallet: Wallet;
}): JSX.Element {
  const theme = useTheme();
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
      if (
        partialTxResponse?.body?.unsignedTx !== undefined &&
        partialTxResponse?.body?.inputIndicesHost !== undefined &&
        partialTxResponse?.body?.inputIndicesGuest !== undefined &&
        partialTxResponse?.body?.signedInputsHost !== undefined
      ) {
        console.log(`GONNA SET`);
        console.log(partialTxResponse.body.unsignedTx);
        setUnsignedTx(partialTxResponse.body.unsignedTx);
        setInputIndicesHost(partialTxResponse.body.inputIndicesHost);
        setInputIndicesGuest(partialTxResponse.body.inputIndicesGuest);
        setSignedInputsHost(partialTxResponse.body.signedInputsHost);
      }
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
      inputIndicesGuest === undefined
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
      console.log(`submitted txId: ${signedTx.id}`);
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
  }, [unsignedTx]);

  if (submittedTxId !== undefined) {
    return <TradingSessionFinished txId={submittedTxId} />;
  }

  return (
    <WaitingPhaseHostContainer>
      <CenteredDivVertical>
        <CenteredDivHorizontal>
          <Heading1>
            Welcome to trading room #
            <TextPrimaryWrapper>{props.tradingSessionId}</TextPrimaryWrapper>!
          </Heading1>
        </CenteredDivHorizontal>
        <CenteredDivHorizontal>
          <WaitingPhaseGuestGuide />
        </CenteredDivHorizontal>
        <CenteredDivHorizontal>
          <Hourglass width={128} height={128} fill={theme.properties.colorBg} />
        </CenteredDivHorizontal>
      </CenteredDivVertical>
    </WaitingPhaseHostContainer>
  );
}
