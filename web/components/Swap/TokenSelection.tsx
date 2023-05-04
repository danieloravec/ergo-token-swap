import styled from 'styled-components';
import { Heading3, TextNavs } from '@components/Common/Text';
import React, { type ReactNode, useState } from 'react';
import { Div, FlexDiv } from '@components/Common/Alignment';
import { spacing } from '@themes/spacing';
import { Toggle } from '@components/Common/Toggle';
import { type FungibleToken, type Nft } from '@components/Swap/types';
import { NftDisplay } from '@components/Tokens/NftDisplay';
import { FungibleTokenDisplay } from '@components/Tokens/FungibleTokenDisplay';

const TokenSelectionBody = styled.div<{ width: number }>`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-content: flex-start;
  background: ${(props) => props.theme.properties.colorNavs};
  width: ${(props) => `${props.width}px`};
  height: 600px;
  box-shadow: ${(props) => {
    return `0 3px 10px ${props.theme.properties.colorNavs}`;
  }};
  overflow-y: auto;
  padding: ${() => `${spacing.spacing_xs}px`};
`;

const TokenSelectionHeading = styled.div<{ width: number }>`
  height: 40px;
  width: ${(props) => `${props.width}px`};
  background: ${(props) => props.theme.properties.colorSecondary};
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  position: relative;
  align-content: center;
`;

const recordFromNftTokenIds = (
  nftTokenIds: string[]
): Record<string, bigint> => {
  const record: Record<string, bigint> = {};
  nftTokenIds.forEach((tokenId) => {
    record[tokenId] = BigInt(1);
  });
  return record;
};

export function TokenSelection(props: {
  width?: number;
  description: string;
  headingNft: ReactNode;
  headingFungible: ReactNode;
  nfts: Nft[];
  fungibleTokens: FungibleToken[];
  nanoErg: bigint;
  onChange: (
    newSelectedNfts: Record<string, bigint>,
    newSelectedNanoErg: bigint,
    newSelectedFungibleTokens: Record<string, bigint>
  ) => void;
}): JSX.Element {
  const [selectedNftIds, setSelectedNftIds] = useState<string[]>([]); // We probably don't need a Set here
  const [selectedNanoErg, setSelectedNanoErg] = useState<bigint>(BigInt(0));
  const [selectedFungibleAmounts, setSelectedFungibleAmounts] = useState<
    Record<string, bigint>
  >({});
  const [showNftSelect, setShowNftSelect] = useState(true);
  const toggleNftSelected = (tokenId: string): void => {
    if (selectedNftIds.includes(tokenId)) {
      const newSelectedNftIds = selectedNftIds.filter((id) => id !== tokenId);
      setSelectedNftIds(newSelectedNftIds);
      props.onChange(
        recordFromNftTokenIds(newSelectedNftIds),
        selectedNanoErg,
        selectedFungibleAmounts
      );
    } else {
      setSelectedNftIds([...selectedNftIds, tokenId]);
      props.onChange(
        recordFromNftTokenIds([...selectedNftIds, tokenId]),
        selectedNanoErg,
        selectedFungibleAmounts
      );
    }
  };
  const handleFungibleChange = (tokenId: string, newAmount: bigint): void => {
    const updatedFungibleAmounts = {
      ...selectedFungibleAmounts,
      [tokenId]: newAmount,
    };
    setSelectedFungibleAmounts(updatedFungibleAmounts);
    props.onChange(
      recordFromNftTokenIds(selectedNftIds),
      selectedNanoErg,
      updatedFungibleAmounts
    );
  };
  const handleNanoErgChange = (newAmount: bigint): void => {
    setSelectedNanoErg(newAmount);
    console.log(`NanoErg changed to: ${newAmount}`);
    props.onChange(
      recordFromNftTokenIds(selectedNftIds),
      newAmount,
      selectedFungibleAmounts
    );
  };
  const width = props.width ?? 420;
  return (
    <Div>
      <FlexDiv style={{ justifyContent: 'space-between' }}>
        <Heading3 style={{ width: Math.floor(width / 2) }}>
          {props.description}
        </Heading3>
        <Toggle
          leftOption="NFT"
          rightOption="Fungible"
          onToggle={(toggledToSide: 'left' | 'right') => {
            if (toggledToSide === 'left') {
              setShowNftSelect(true);
            } else {
              setShowNftSelect(false);
            }
          }}
        />
      </FlexDiv>
      <TokenSelectionHeading width={width}>
        <TextNavs>
          {showNftSelect ? props.headingNft : props.headingFungible}
        </TextNavs>
      </TokenSelectionHeading>
      <TokenSelectionBody width={width}>
        {showNftSelect ? (
          props.nfts.map((nft) => (
            <NftDisplay
              nft={nft}
              imgSize={180}
              key={nft.tokenId}
              onClick={toggleNftSelected}
              isSelected={selectedNftIds.includes(nft.tokenId)}
            />
          ))
        ) : (
          <Div>
            <FungibleTokenDisplay
              fungibleToken={{
                name: 'Ergo',
                tokenId:
                  '0000000000000000000000000000000000000000000000000000000000000000',
                amount: props.nanoErg,
                decimals: 9,
              }}
              initialValue={selectedNanoErg ?? BigInt(0)}
              onChange={handleNanoErgChange}
            />
            {props.fungibleTokens.map((fungibleToken: FungibleToken) => (
              <FungibleTokenDisplay
                fungibleToken={fungibleToken}
                key={fungibleToken.tokenId}
                initialValue={
                  selectedFungibleAmounts[fungibleToken.tokenId] ?? BigInt(0)
                }
                onChange={(newAmount: bigint) => {
                  handleFungibleChange(fungibleToken.tokenId, newAmount);
                }}
              />
            ))}
          </Div>
        )}
      </TokenSelectionBody>
    </Div>
  );
}
