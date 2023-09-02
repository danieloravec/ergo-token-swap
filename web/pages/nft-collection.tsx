import { FlexDiv } from '@components/Common/Alignment';
import { Button } from '@components/Common/Button';
import { backendRequest } from '@utils/utils';
import { Input } from '@components/Common/Text';
import { useState } from 'react';
import { useWalletStore } from '@components/Wallet/hooks';
import {
  type DataInput,
  type EIP12UnsignedTransaction,
  type SignedInput,
  type SignedTransaction,
} from '@fleet-sdk/common';
import { type Amount, type Box } from '@fleet-sdk/core';
import JSONBig from 'json-bigint';

const NftCollection = (): JSX.Element => {
  const [mintAmount, setMintAmount] = useState<number>(0);
  const { wallet, address } = useWalletStore();

  const handleMint = (amountToMint: number): void => {
    if (amountToMint === 0 || wallet === undefined || address === undefined) {
      return;
    }
    const mintNft = async (amountToMint: number): Promise<void> => {
      const mintingTxInfo: {
        status: number;
        body?: {
          unsignedTx: EIP12UnsignedTransaction;
          signedMintInputs: SignedInput[];
          inputIndicesMint: number[];
        };
      } = await backendRequest('/tx/mint/build', 'POST', {
        address,
        amount: amountToMint,
      });

      if (mintingTxInfo.status !== 200 || mintingTxInfo.body === undefined) {
        throw new Error(
          `Error minting NFT, backend returned this: ${JSONBig.stringify(
            mintingTxInfo
          )}`
        );
      }

      const body = mintingTxInfo.body;

      console.log(`mintingTxInfo: ${JSONBig.stringify(mintingTxInfo)}`);

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
        ...body.unsignedTx,
        id: txId,
        inputs: mergedSignedInputs,
        dataInputs: [] as DataInput[],
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

      const submittedTxId = await backendRequest('/tx/mint/submit', 'POST', {
        type: 'mint',
        signedTx,
      });

      console.log(`submitted minting tx with id: ${submittedTxId}`);
    };
    mintNft(amountToMint).catch(console.error);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setMintAmount(Number(e.target.value));
  };

  return (
    <FlexDiv>
      <Input type="number" onChange={handleAmountChange} />
      <Button
        onClick={(e) => {
          handleMint(mintAmount);
        }}
      >
        Mint NFT
      </Button>
    </FlexDiv>
  );
};

export default NftCollection;
