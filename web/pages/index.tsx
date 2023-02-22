import { Nav } from '@components/Nav/Nav';
import React from 'react';
import { Footer } from '@components/Footer/Footer';
import { Accordion } from '@components/Common/Accordion';
import {
  CenteredDiv,
  CenteredDivHorizontal,
  Div,
  MainSectionDiv,
} from '@components/Common/Alignment';
import { Introduction } from '@components/Home/Introduction';
import Image from 'next/image';
import beastImage from '@public/token-swap-beast.png';
import { Alert } from '@components/Common/Alert';
import styled from 'styled-components';

const ColumnContainer = styled(CenteredDivHorizontal)`
  width: 100%;

  @media (min-width: 768px) {
    width: 50%;
  }
`;

const ImageColumnContainer = styled.div`
  position: relative;
  width: 300px;
  height: 300px;

  @media (min-width: 768px) {
    width: 600px;
    height: 600px;
  }
`;

export default function Home(): JSX.Element {
  return (
    <Div>
      <Nav />
      <MainSectionDiv style={{ justifyContent: 'space-evenly' }}>
        <CenteredDiv>
          <Alert type="error">
            This is a beta version of single-tx-swap. Please only use tokens
            that don't have value for testing.
          </Alert>
          <ColumnContainer>
            <Introduction />
            <Accordion
              width="80%"
              title="FAQ"
              entries={[
                {
                  question: 'What is this?',
                  answer:
                    'A multisig trustless escrow service on Ergo. If you want to swap some NFTs and tokens with ' +
                    'someone you met on Discord, you can start a trading session here and send them a link to your private ' +
                    'trading room.',
                },
                {
                  question: 'Do you use smart contracts?',
                  answer:
                    "We don't need them! The swap happens in a single transaction that both parties sign.",
                },
                {
                  question: 'Is this secure?',
                  answer:
                    'Yes! There are basically no risks if you carefully check the transaction before signing it. ' +
                    'Once the transaction is submitted, the swap happens as a whole or does not happen at all if it fails.',
                },
                {
                  question: 'Which wallets are supported?',
                  answer:
                    'Features we need are currently only implemented in a beta release of Nautilus wallet. ' +
                    'If you would like to test this application, you have to install a beta release that can be found ' +
                    'here: https://github.com/capt-nemo429/nautilus-wallet/releases/tag/v0.8.0-alpha.0',
                },
                {
                  question: 'Are there any fees?',
                  answer:
                    'We are in a testing phase and we charge a flat fee of 0.05 $ERG per swap paid by both parties. ' +
                    'We will adjust the fee appropriately in the future.',
                },
                {
                  question: 'Can I see the source code?',
                  answer:
                    'Of course! The open-source nature of Ergo helped us a lot and we want to move the ecosystem forward. ' +
                    'Our GitHub is linked in the footer.',
                },
              ]}
            />
          </ColumnContainer>
          <ImageColumnContainer>
            <Image
              fill
              src={beastImage}
              placeholder="blur"
              alt="Token swapping transaction"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </ImageColumnContainer>
        </CenteredDiv>
      </MainSectionDiv>
      <Footer />
    </Div>
  );
}
