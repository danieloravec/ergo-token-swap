import {
  CenteredDivHorizontal,
  FlexDivRow,
} from '@components/Common/Alignment';
import { Button } from '@components/Common/Button';
import { backendRequest } from '@utils/utils';
import { A, Heading1, Input } from '@components/Common/Text';
import { useState } from 'react';
import { useWalletStore } from '@components/Wallet/hooks';
import {
  type DataInput,
  type EIP12UnsignedTransaction,
  type SignedInput,
  type SignedTransaction,
} from '@fleet-sdk/common';
import { type Amount, type Box } from '@fleet-sdk/core';
import { Alert } from '@components/Common/Alert';
import { config } from '@config';
import { useTheme } from 'styled-components';

const NftCollectionHeading = (): JSX.Element => {
  const theme = useTheme();
  return (
    <FlexDivRow>
      <CenteredDivHorizontal>
        {/* <Heading1 style={{fontSize: "60px", color: theme.properties.colorSecondary}}>UTxO Beastz</Heading1> */}
        <Heading1 style={{ fontSize: '7em' }}>
          <span style={{ color: theme.properties.colorSecondary }}>UTxO</span>{' '}
          Beastz
        </Heading1>
      </CenteredDivHorizontal>
    </FlexDivRow>
  );
};

const NftCollection = (): JSX.Element => {
  const [mintAmount, setMintAmount] = useState<number>(0);
  const [submittedTxId, setSubmittedTxId] = useState<string | undefined>(
    undefined
  );
  const [error, setError] = useState<string | undefined>(undefined);
  const { wallet, address } = useWalletStore();

  interface BuildMintTxBodySuccess {
    unsignedTx: EIP12UnsignedTransaction;
    signedMintInputs: SignedInput[];
    inputIndicesMint: number[];
  }

  const handleMint = (amountToMint: number): void => {
    setError(undefined);
    setSubmittedTxId(undefined);

    if (amountToMint === 0 || wallet === undefined || address === undefined) {
      return;
    }
    const mintNft = async (amountToMint: number): Promise<void> => {
      const mintingTxInfo: {
        status: number;
        body?: BuildMintTxBodySuccess | { message: string };
      } = await backendRequest('/tx/mint/build', 'POST', {
        address,
        amount: amountToMint,
      });

      if (mintingTxInfo.status !== 200) {
        setError(
          `Error minting NFT: ${
            (mintingTxInfo.body as { message: string }).message
          }`
        );
        return;
      }

      const body = mintingTxInfo.body as BuildMintTxBodySuccess;

      const mintInputsErgoTree =
        body.unsignedTx.inputs[body.inputIndicesMint[0]].ergoTree;
      const userInputIndices = body.unsignedTx.inputs
        .map((input, idx) => {
          return input.ergoTree === mintInputsErgoTree ? -1 : idx;
        })
        .filter((idx) => idx !== -1);
      const signedUserInputs = await wallet.signTxInputs(
        body.unsignedTx,
        userInputIndices
      );

      const mergedSignedInputs = [];
      for (let i = 0; i < body.inputIndicesMint.length; i++) {
        mergedSignedInputs[body.inputIndicesMint[i]] = body.signedMintInputs[i];
      }
      for (let i = 0; i < userInputIndices.length; i++) {
        mergedSignedInputs[userInputIndices[i]] = signedUserInputs[i];
      }

      const txId = body.unsignedTx.id as string;
      const signedTx: SignedTransaction = {
        dataInputs: [] as DataInput[],
        id: txId,
        inputs: mergedSignedInputs,
        outputs: body.unsignedTx.outputs.map((output, i) => {
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

      const submitTxResult = await backendRequest('/tx/mint/submit', 'POST', {
        type: 'mint',
        signedTx,
      });

      if (submitTxResult.status === 200) {
        setSubmittedTxId(submitTxResult.body.message);
      } else {
        setError(submitTxResult.body.message);
      }
    };
    mintNft(amountToMint).catch(console.error);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setMintAmount(Number(e.target.value));
  };

  return (
    <FlexDivRow>
      <NftCollectionHeading />
      {error !== undefined && (
        <Alert type="error" marginSides="0px">
          {error}
        </Alert>
      )}
      {submittedTxId !== undefined && (
        <Alert type="success" marginSides="0px">
          Successfully submitted a minting transaction. You can view it in the{' '}
          <A
            target="_blank"
            href={`${config.explorerFrontendUrl}/transactions/${submittedTxId}`}
          >
            explorer
          </A>
          .
        </Alert>
      )}
      <Input type="number" onChange={handleAmountChange} />
      <Button
        onClick={(e) => {
          handleMint(mintAmount);
        }}
      >
        Mint NFT
      </Button>
    </FlexDivRow>
  );
};

export default NftCollection;
