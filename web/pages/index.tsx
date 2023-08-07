import React from 'react';
import { Accordion } from '@components/Common/Accordion';
import {
  CenteredDiv,
  CenteredDivHorizontal,
  Div,
  FlexDiv,
} from '@components/Common/Alignment';
import { Introduction } from '@components/Home/Introduction';
import Image from 'next/image';
import beastImage from '@public/token-swap-beast.png';
import styled from 'styled-components';
import NoSsr from '@components/Common/NoSsr';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';

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
    <NoSsr>
      <Div>
        <FlexDiv style={{ justifyContent: 'space-evenly' }}>
          <CenteredDiv>
            <ColumnContainer>
              <Introduction />
              <NoSsr>
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
                        'For now, only Nautilus wallet supports features we need.',
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
              </NoSsr>
              <Spacer size={spacing.spacing_m} vertical />
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
        </FlexDiv>
      </Div>
    </NoSsr>
  );
}
