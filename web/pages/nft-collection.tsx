import {
  CenteredDivHorizontal,
  FlexDiv,
  FlexDivRow,
} from '@components/Common/Alignment';
import { Button, DisabledButton } from '@components/Common/Button';
import { backendRequest } from '@utils/utils';
import { A, Heading1, Heading2 } from '@components/Common/Text';
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
import styled, { useTheme } from 'styled-components';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import Image from 'next/image';
import { useWindowDimensions } from '@components/hooks';
import { Select } from '@components/Common/Inputs';

const HeadingContainer = styled(CenteredDivHorizontal)`
  width: 50%;

  @media (max-width: 1200px) {
    width: 90%;
  }
`;

const HeadingTextContainer = styled(Heading1)`
  font-size: 6em;

  @media (max-width: 450px) {
    font-size: 4em;
  }
`;

const NftCollectionHeading = (): JSX.Element => {
  const theme = useTheme();
  return (
    <CenteredDivHorizontal
      style={{
        width: '100%',
        color: theme.properties.colorBgText,
        textAlign: 'center',
      }}
    >
      <HeadingContainer>
        <HeadingTextContainer>
          <span style={{ color: theme.properties.colorPrimary }}>UTxO</span>{' '}
          Beastz
        </HeadingTextContainer>
        <FlexDiv>
          <p style={{ fontSize: '32px' }}>
            <strong>
              Discover the first 10k NFT collection on #Ergo that gives you
              actual{' '}
              <span style={{ color: theme.properties.colorSecondary }}>
                utility
              </span>
              . Get discounts on trading by just holding NFTs that you can get
              for{' '}
              <span style={{ color: theme.properties.colorSecondary }}>
                free
              </span>
              !
            </strong>
          </p>

          <p style={{ fontSize: '22px' }}>
            Get an NFT for{' '}
            <span style={{ color: theme.properties.colorSecondary }}>
              <strong>free</strong>
            </span>{' '}
            for every swap you perform on{' '}
            <A href={config.ownUrl}>{config.ownUrl.slice('https://'.length)}</A>
            , or directly mint some here for 0.9 $ERG a piece.
          </p>
        </FlexDiv>
      </HeadingContainer>
    </CenteredDivHorizontal>
  );
};

const GalleryImageContainer = styled.div`
  flex: 1;
  max-width: 30%;
  margin: 10px;

  @media (max-width: 1200px) {
    max-width: 40%;
  }

  @media (max-width: 450px) {
    max-width: 90%;
  }
`;

const Gallery = (): JSX.Element => {
  const { width } = useWindowDimensions();
  const numImages = 6;
  const imagesPerLine = width < 450 ? 1 : width < 1200 ? 2 : 3;
  const imageDimension = Math.floor((width / imagesPerLine) * 0.9);

  const images = [
    <Image
      src="/beastz-gallery/109.jpg"
      alt="UTxO Beast"
      width={imageDimension}
      height={imageDimension}
    />,
    <Image
      src="/beastz-gallery/9996.jpg"
      alt="UTxO Beast"
      width={imageDimension}
      height={imageDimension}
    />,
    <Image
      src="/beastz-gallery/637.jpg"
      alt="UTxO Beast"
      width={imageDimension}
      height={imageDimension}
    />,
    <Image
      src="/beastz-gallery/9999.jpg"
      alt="UTxO Beast"
      width={imageDimension}
      height={imageDimension}
    />,
    <Image
      src="/beastz-gallery/647.jpg"
      alt="UTxO Beast"
      width={imageDimension}
      height={imageDimension}
    />,
    <Image
      src="/beastz-gallery/9986.jpg"
      alt="UTxO Beast"
      width={imageDimension}
      height={imageDimension}
    />,
  ].slice(0, numImages);

  return (
    <FlexDivRow
      style={{
        flexDirection: 'row',
        minHeight: '400px',
        justifyContent: 'space-evenly',
        alignItems: 'flex-start',
      }}
    >
      {images.map((image, idx) => {
        return <GalleryImageContainer key={idx}>{image}</GalleryImageContainer>;
      })}
    </FlexDivRow>
  );
};

const DiscountsTableContainer = styled(FlexDiv)`
  width: 50%;

  @media (max-width: 1200px) {
    width: 90%;
  }
`;

const DiscountsTable = (): JSX.Element => {
  const theme = useTheme();

  const data = [
    {
      minBeastzRequirement: 1,
      discountPercent: 25,
    },
    {
      minBeastzRequirement: 5,
      discountPercent: 50,
    },
    {
      minBeastzRequirement: 20,
      discountPercent: 75,
    },
  ];

  return (
    <FlexDivRow>
      <Heading2>
        Hold UTxo Beastz to get{' '}
        <span style={{ color: theme.properties.colorSecondary }}>
          discounts
        </span>{' '}
        on {config.ownUrl.slice('https://'.length)}:
      </Heading2>
      {data.map((info, idx) => {
        return (
          <FlexDivRow
            style={{
              fontSize: '22px',
              minHeight: '50px',
              border: `1px solid ${theme.properties.colorBgText}`,
            }}
          >
            <FlexDiv
              style={{
                width: '50%',
                paddingInline: `${spacing.spacing_xs}px`,
                alignItems: 'center',
              }}
            >
              ≥ {info.minBeastzRequirement} UTxO Beastz
            </FlexDiv>
            <FlexDiv style={{ width: '50%', alignItems: 'center' }}>
              {info.discountPercent}% discount on trading fees
            </FlexDiv>
          </FlexDivRow>
        );
      })}
    </FlexDivRow>
  );
};

const NftCollection = (): JSX.Element => {
  const [mintAmount, setMintAmount] = useState<number>(1);
  const [submittedTxId, setSubmittedTxId] = useState<string | undefined>(
    undefined
  );
  const [error, setError] = useState<string | undefined>(undefined);
  const { wallet, address } = useWalletStore();
  const theme = useTheme();

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

  const handleAmountChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setMintAmount(Number(e.target.value));
  };

  return (
    <FlexDivRow>
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

      <NftCollectionHeading />

      <FlexDivRow>
        <CenteredDivHorizontal>
          <span style={{ fontSize: '22px', fontWeight: 'strong' }}>
            Amount:
          </span>
          <Spacer size={spacing.spacing_xxs} vertical={false} />
          <Select onChange={handleAmountChange}>
            {[
              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
              20,
            ].map((amount) => {
              return (
                <option key={amount} value={amount}>
                  {amount}
                </option>
              );
            })}
          </Select>
          <Spacer size={spacing.spacing_xxs} vertical={false} />
          {address !== undefined ? (
            <Button
              style={{ fontSize: '16px' }}
              onClick={(e) => {
                handleMint(mintAmount);
              }}
            >
              Mint
            </Button>
          ) : (
            <DisabledButton disabled>Wallet not connected</DisabledButton>
          )}
        </CenteredDivHorizontal>
      </FlexDivRow>

      <Spacer size={spacing.spacing_xxxl} vertical />
      <CenteredDivHorizontal>
        <DiscountsTableContainer>
          <DiscountsTable />
        </DiscountsTableContainer>
      </CenteredDivHorizontal>

      <Spacer size={spacing.spacing_xxxl} vertical />
      <FlexDivRow>
        <CenteredDivHorizontal>
          <FlexDiv style={{ width: '50%' }}>
            <p style={{ fontSize: '22px', textAlign: 'center' }}>
              Each UTxO Beast NFT represents a{' '}
              <span style={{ color: theme.properties.colorSecondary }}>
                transaction
              </span>{' '}
              in the UTxO model. A transaction eats some{' '}
              <span style={{ color: theme.properties.colorSecondary }}>
                inputs
              </span>{' '}
              and produces{' '}
              <span style={{ color: theme.properties.colorSecondary }}>
                outputs
              </span>{' '}
              in exchange.
            </p>
          </FlexDiv>
        </CenteredDivHorizontal>
      </FlexDivRow>

      <Spacer size={spacing.spacing_xxxl} vertical />
      <FlexDivRow>
        <Gallery />
      </FlexDivRow>
    </FlexDivRow>
  );
};

export default NftCollection;
