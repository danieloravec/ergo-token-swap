import styled, { useTheme, ThemeProvider } from 'styled-components';
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
import { combineSignedInputs } from '@components/Swap/utils';

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

  useEffect(() => {
    if (
      unsignedTx === undefined ||
      inputIndicesCreator === undefined ||
      inputIndicesGuest === undefined ||
      signedInputsCreator === undefined
    ) {
      const interval = setInterval(() => {
        const fetchPartialTxInfo = async (): Promise<void> => {
          let unsignedTxReady = false;
          while (!unsignedTxReady) {
            try {
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
                unsignedTxReady = true;
                setUnsignedTx(partialTxResponse.body.unsignedTx);
                setInputIndicesCreator(
                  partialTxResponse.body.inputIndicesCreator
                );
                setInputIndicesGuest(partialTxResponse.body.inputIndicesGuest);
                setSignedInputsCreator(
                  partialTxResponse.body.signedInputsCreator
                );
              }
            } catch (err) {
              console.error(err);
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        };
        fetchPartialTxInfo().catch(console.error);
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [unsignedTx, inputIndicesCreator, inputIndicesGuest, signedInputsCreator]);

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
      const txId = unsignedTx.id;
      if (txId === undefined) {
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
    };
    finalizeGuestSigningAndSubmit().catch(console.error);
  }, [unsignedTx, signedInputsCreator, inputIndicesCreator, inputIndicesGuest]);

  return (
    <ThemeProvider theme={theme}>
      <WaitingPhaseCreatorContainer>
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
            <Hourglass
              width={128}
              height={128}
              fill={theme.properties.colorBg}
            />
          </CenteredDivHorizontal>
        </CenteredDivVertical>
      </WaitingPhaseCreatorContainer>
    </ThemeProvider>
  );
}
