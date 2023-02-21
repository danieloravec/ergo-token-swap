import styled, { useTheme } from 'styled-components';
import {
  Heading1,
  Heading3,
  OrderedList,
  TextPrimaryWrapper,
  A,
} from '@components/Common/Text';
import { Hourglass } from '@components/Icons/Hourglass';
import React, { useEffect, useState } from 'react';
import {
  CenteredDivHorizontal,
  CenteredDivVertical,
  Div,
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
import { combineSignedInputs } from '@components/Swap/utils';
import { config } from '@config';

const WaitingPhaseCreatorContainer = styled.div`
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
  const [inputIndicesCreator, setInputIndicesCreator] = useState<
    number[] | undefined
  >(undefined);
  const [inputIndicesGuest, setInputIndicesGuest] = useState<
    number[] | undefined
  >(undefined);
  const [signedInputsCreator, setSignedInputsCreator] = useState<
    SignedInput[] | undefined
  >(undefined);
  const [submittedTxId, setSubmittedTxId] = useState<string | undefined>(
    undefined
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchIsFinished = async (): Promise<void> => {
      const isFinishedResponse = await backendRequest(
        `/tx?secret=${props.tradingSessionId}`
      );
      if (
        isFinishedResponse.status !== 200 ||
        isFinishedResponse?.body?.submitted === undefined
      ) {
        console.error('Failed to get isFinished');
        setSubmittedTxId(undefined);
      } else if (isFinishedResponse.body.submitted === true) {
        setSubmittedTxId(isFinishedResponse.body.txId);
      } else {
        setSubmittedTxId(undefined);
      }
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
        partialTxResponse?.body?.inputIndicesCreator !== undefined &&
        partialTxResponse?.body?.inputIndicesGuest !== undefined &&
        partialTxResponse?.body?.signedInputsCreator !== undefined
      ) {
        setUnsignedTx(partialTxResponse.body.unsignedTx);
        setInputIndicesCreator(partialTxResponse.body.inputIndicesCreator);
        setInputIndicesGuest(partialTxResponse.body.inputIndicesGuest);
        setSignedInputsCreator(partialTxResponse.body.signedInputsCreator);
      }
    };
    fetchPartialTxInfo().catch(console.error);
  }, [isLoaded]);

  useEffect(() => {
    if (
      unsignedTx === undefined ||
      signedInputsCreator === undefined ||
      inputIndicesCreator === undefined ||
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
        signedInputsCreator,
        signedGuestInputs,
        inputIndicesCreator,
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
  }, [unsignedTx, signedInputsCreator, inputIndicesCreator, inputIndicesGuest]);

  return (
    <WaitingPhaseCreatorContainer>
      <CenteredDivVertical>
        <CenteredDivHorizontal>
          <Heading1>
            Welcome to trading room #
            <TextPrimaryWrapper>{props.tradingSessionId}</TextPrimaryWrapper>!
          </Heading1>
        </CenteredDivHorizontal>
        {submittedTxId !== undefined ? (
          <CenteredDivHorizontal>
            <Heading3>
              The session transaction was{' '}
              <A
                target="_blank"
                href={`${config.explorerFrontendUrl}/en/transactions/${submittedTxId}`}
              >
                submitted
              </A>
              .
            </Heading3>
          </CenteredDivHorizontal>
        ) : (
          <Div>
            <CenteredDivHorizontal>
              <WaitingPhaseGuestGuide />
            </CenteredDivHorizontal>
            <CenteredDivHorizontal>
              <Hourglass
                width={128}
                height={128}
                fill={theme.properties.colorBg}
              />
            </CenteredDivHorizontal>
          </Div>
        )}
      </CenteredDivVertical>
    </WaitingPhaseCreatorContainer>
  );
}
