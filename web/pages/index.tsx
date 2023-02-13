import { Nav } from '@components/Nav/Nav';
import { ThemeProvider } from 'styled-components';
import { useThemeStore } from '@components/hooks';
import React from 'react';
import { Footer } from '@components/Footer/Footer';
import { Accordion } from '@components/Common/Accordion';
import { FlexDiv, MainSectionDiv } from '@components/Common/Alignment';
import { Introduction } from '@components/Home/Introduction';
import Image from 'next/image';
import beastImage from '@public/token-swap-beast.png';

export default function Home(): JSX.Element {
  const { theme } = useThemeStore();
  const mockedNfts: Nft[] = [
    {
      imageUrl:
        'https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg',
      name: 'Mocked NFT #0001',
      tokenId:
        'b6bde800cf80f1201d22d938ded5a7c47ec389427f49b20e0099b75cfb5cb403',
    },
    {
      imageUrl:
        'https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg',
      name: 'Mocked NFT #0001',
      tokenId:
        'b6bde800cf80f1201d22d938ded5a7c47ec389427f49b20e0099b75cfb5cb403',
    },
    {
      imageUrl:
        'https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg',
      name: 'Mocked NFT #0001',
      tokenId:
        'b6bde800cf80f1201d22d938ded5a7c47ec389427f49b20e0099b75cfb5cb403',
    },
    {
      imageUrl:
        'https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg',
      name: 'Mocked NFT #0001',
      tokenId:
        'b6bde800cf80f1201d22d938ded5a7c47ec389427f49b20e0099b75cfb5cb403',
    },
    {
      imageUrl:
        'https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg',
      name: 'Mocked NFT #0001',
      tokenId:
        'b6bde800cf80f1201d22d938ded5a7c47ec389427f49b20e0099b75cfb5cb403',
    },
    {
      imageUrl:
        'https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg',
      name: 'Mocked NFT #0001',
      tokenId:
        'b6bde800cf80f1201d22d938ded5a7c47ec389427f49b20e0099b75cfb5cb403',
    },
    {
      imageUrl:
        'https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg',
      name: 'Mocked NFT #0001',
      tokenId:
        'b6bde800cf80f1201d22d938ded5a7c47ec389427f49b20e0099b75cfb5cb403',
    },
    {
      imageUrl:
        'https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg',
      name: 'Mocked NFT #0001',
      tokenId:
        'b6bde800cf80f1201d22d938ded5a7c47ec389427f49b20e0099b75cfb5cb403',
    },
    {
      imageUrl:
        'https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg',
      name: 'Mocked NFT #0001',
      tokenId:
        'b6bde800cf80f1201d22d938ded5a7c47ec389427f49b20e0099b75cfb5cb403',
    },
    {
      imageUrl:
        'https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg',
      name: 'Mocked NFT #0001',
      tokenId:
        'b6bde800cf80f1201d22d938ded5a7c47ec389427f49b20e0099b75cfb5cb403',
    },
    {
      imageUrl:
        'https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-network-placeholder-png-image_3416659.jpg',
      name: 'Mocked NFT #0001',
      tokenId:
        'b6bde800cf80f1201d22d938ded5a7c47ec389427f49b20e0099b75cfb5cb403',
    },
  ];
  return (
    <ThemeProvider theme={theme}>
      <Nav />
      <MainSectionDiv style={{ justifyContent: 'space-evenly' }}>
        <FlexDiv>
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
                    "We are in a testing phase where we don't charge any fees. We will add a small fee in the future.",
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
            style={{ position: 'relative', width: '50%', aspectRatio: '1 / 1' }}
          >
            <Image
              fill
              src={beastImage}
              placeholder="blur"
              alt="Token swapping transaction"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </FlexDiv>
      </MainSectionDiv>
      <Footer />
    </ThemeProvider>
  );
}
