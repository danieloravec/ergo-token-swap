import styled, { useTheme } from 'styled-components';
import { Heading1, Heading3, TextNavs } from '@components/Common/Text';
import React, { type ReactNode, useMemo, useState } from 'react';
import { Div, FlexDiv } from '@components/Common/Alignment';
import { spacing } from '@themes/spacing';
import { Toggle } from '@components/Common/Toggle';
import { type FungibleToken, type Nft } from '@components/Swap/types';
import { NftDisplay } from '@components/Tokens/NftDisplay';
import { FungibleTokenDisplay } from '@components/Tokens/FungibleTokenDisplay';
import ColouredHeading from '@components/Swap/ColouredHeading';
import { config } from '@config';
import { blitzData } from '@utils/special/blitz';

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
    newSelectedNftsDetails: Nft[],
    newSelectedNanoErg: bigint,
    newSelectedFungibleTokens: Record<string, bigint>,
    newSelectedFungibleTokensDetails: FungibleToken[]
  ) => void;
}): JSX.Element {
  const [selectedNftIds, setSelectedNftIds] = useState<string[]>([]); // We probably don't need a Set here
  const [selectedNftDetails, setSelectedNftDetails] = useState<Nft[]>([]);
  const [selectedNanoErg, setSelectedNanoErg] = useState<bigint>(BigInt(0));
  const [selectedFungibleAmounts, setSelectedFungibleAmounts] = useState<
    Record<string, bigint>
  >({});
  const [selectedFungibleDetails, setSelectedFungibleDetails] = useState<
    FungibleToken[]
  >([]);
  const [showNftSelect, setShowNftSelect] = useState(true);
  const filteredNfts = useMemo(
    () => props.nfts.filter((nft) => nft.tokenId in blitzData),
    [props.nfts]
  );
  const theme = useTheme();

  const toggleNftSelected = (nft: Nft): void => {
    if (selectedNftIds.includes(nft.tokenId)) {
      const newSelectedNftIds = selectedNftIds.filter(
        (id) => id !== nft.tokenId
      );
      const newSelectedNftDetails = selectedNftDetails.filter(
        (selectedNft) => selectedNft.tokenId !== nft.tokenId
      );
      setSelectedNftIds(newSelectedNftIds);
      setSelectedNftDetails(newSelectedNftDetails);
      props.onChange(
        recordFromNftTokenIds(newSelectedNftIds),
        newSelectedNftDetails,
        selectedNanoErg,
        selectedFungibleAmounts,
        selectedFungibleDetails
      );
    } else {
      setSelectedNftIds([...selectedNftIds, nft.tokenId]);
      setSelectedNftDetails([...selectedNftDetails, nft]);
      props.onChange(
        recordFromNftTokenIds([...selectedNftIds, nft.tokenId]),
        [...selectedNftDetails, nft],
        selectedNanoErg,
        selectedFungibleAmounts,
        selectedFungibleDetails
      );
    }
  };
  const handleFungibleChange = (tokenId: string, newAmount: bigint): void => {
    const isNew =
      selectedFungibleAmounts[tokenId] === undefined ||
      selectedFungibleAmounts[tokenId] === BigInt(0);
    const updatedFungibleAmounts = {
      ...selectedFungibleAmounts,
      [tokenId]: newAmount,
    };
    const updatedFungibleDetails = selectedFungibleDetails
      .map((ft) => {
        if (ft.tokenId === tokenId) {
          return { ...ft, amount: newAmount };
        }
        return ft;
      })
      .filter((ft) => ft.amount > BigInt(0));
    if (isNew && newAmount > BigInt(0)) {
      const newFungibleToken = props.fungibleTokens.find(
        (ft) => ft.tokenId === tokenId
      );
      if (newFungibleToken !== undefined) {
        updatedFungibleDetails.push({ ...newFungibleToken, amount: newAmount });
      }
    }
    setSelectedFungibleAmounts(updatedFungibleAmounts);
    setSelectedFungibleDetails(updatedFungibleDetails);
    props.onChange(
      recordFromNftTokenIds(selectedNftIds),
      selectedNftDetails,
      selectedNanoErg,
      updatedFungibleAmounts,
      updatedFungibleDetails
    );
  };
  const handleNanoErgChange = (newAmount: bigint): void => {
    setSelectedNanoErg(newAmount);
    props.onChange(
      recordFromNftTokenIds(selectedNftIds),
      selectedNftDetails,
      newAmount,
      selectedFungibleAmounts,
      selectedFungibleDetails
    );
  };
  // const width = props.width ?? 420;
  const width = props.width ?? 640;
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
      <ColouredHeading width={width}>
        <TextNavs>
          {showNftSelect ? props.headingNft : props.headingFungible}
        </TextNavs>
      </ColouredHeading>
      <TokenSelectionBody width={width}>
        {showNftSelect ? (
          <FlexDiv>
            {filteredNfts.length === 0 && (
              <FlexDiv>
                <Heading1>
                  <span style={{ color: theme.properties.colorPrimary }}>
                    Blitz TCG
                  </span>{' '}
                  only event!
                </Heading1>
                <span>
                  But you can still swap{' '}
                  <span style={{ color: theme.properties.colorSecondary }}>
                    fungible tokens
                  </span>{' '}
                  for Blitz cards using the <strong>Fungible tab</strong>!
                </span>
              </FlexDiv>
            )}
            {filteredNfts.map((nft) => (
              <NftDisplay
                nft={nft}
                imgSize={180}
                key={nft.tokenId}
                onClick={() => {
                  toggleNftSelected(nft);
                }}
                isSelected={selectedNftIds.includes(nft.tokenId)}
              />
            ))}
          </FlexDiv>
        ) : (
          <FlexDiv style={{ justifyContent: 'space-between' }}>
            <FungibleTokenDisplay
              fungibleToken={{
                name: 'Ergo',
                tokenId: config.ergTokenId,
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
          </FlexDiv>
        )}
      </TokenSelectionBody>
    </Div>
  );
}
