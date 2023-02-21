import { Nav } from '@components/Nav/Nav';
import { ThemeProvider } from 'styled-components';
import { useThemeStore } from '@components/hooks';
import React from 'react';
import { Footer } from '@components/Footer/Footer';
import { Accordion } from '@components/Common/Accordion';
import {
  CenteredDiv,
  FlexDiv,
  MainSectionDiv,
} from '@components/Common/Alignment';
import { Introduction } from '@components/Home/Introduction';
import Image from 'next/image';
import beastImage from '@public/token-swap-beast.png';
import NoSsr from '@components/Common/NoSsr';

export default function Home(): JSX.Element {
  const { theme } = useThemeStore();

  return (
    <NoSsr>
      <ThemeProvider theme={theme}>
        <Nav />
        <MainSectionDiv style={{ justifyContent: 'space-evenly' }}>
          <CenteredDiv>
            <FlexDiv style={{ width: '50%' }}>
              <Introduction />
              <Accordion
                width="600px"
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
            </FlexDiv>
            <div
              style={{ position: 'relative', width: '600px', height: '600px' }}
            >
              <Image
                fill
                src={beastImage}
                placeholder="blur"
                alt="Token swapping transaction"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </CenteredDiv>
        </MainSectionDiv>
        <Footer />
      </ThemeProvider>
    </NoSsr>
  );
}
