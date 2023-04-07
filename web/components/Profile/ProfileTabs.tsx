import React, { useEffect } from 'react';
import { FlexDiv } from '@components/Common/Alignment';
import styled from 'styled-components';
import { Text } from '@components/Common/Text';
import { FungibleList } from '@components/Profile/FungibleList';
import { NftList } from '@components/Profile/NftList';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { type FungibleToken, type Nft } from '@components/Swap/types';
import { backendRequest } from '@utils/utils';
import { type Swap } from '@components/Profile/types';
import { SwapHistory } from '@components/Profile/SwapHistory';

type Tabs = 'NFT' | 'Fungible' | 'History';

const ProfileTabsWrapper = styled(FlexDiv)`
  width: 100%;
  border-bottom: ${(props) => {
    return `1px solid ${props.theme.properties.colorExtras}`;
  }};
`;

const ProfileTab = styled(FlexDiv).attrs((props: { isSelected?: boolean }) => ({
  isSelected: props.isSelected ?? false,
}))`
  width: 128px;
  border-bottom: ${(props) => {
    if (props.isSelected) {
      return `2px solid ${props.theme.properties.colorPrimary}`;
    }
    return 'none';
  }};
  color: ${(props) => {
    if (props.isSelected) {
      return props.theme.properties.colorPrimary;
    }
    return props.theme.properties.colorBgText;
  }};
  &:hover {
    cursor: pointer;
  }
`;

const TabText = styled(Text)`
  color: inherit;
  font-size: 24px;
`;

export const ProfileTabs = (props: { profileAddress: string }): JSX.Element => {
  const [selectedTab, setSelectedTab] = React.useState<Tabs>('NFT');
  const [rawNfts, setRawNfts] = React.useState<Nft[] | undefined>(undefined);
  const [rawFungibles, setRawFungibles] = React.useState<
    FungibleToken[] | undefined
  >(undefined);
  const [history, setHistory] = React.useState<Swap[] | undefined>(undefined);
  // const [nanoErg, setNanoErg] = React.useState<bigint | undefined>(undefined);
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);

  useEffect(() => {
    const fetchAssets = async (): Promise<void> => {
      const assetsResponse = await backendRequest(
        `/user/assets?address=${props.profileAddress}`,
        'GET'
      );
      if (assetsResponse.status === 200) {
        setRawNfts(assetsResponse.body.nfts);
        setRawFungibles(assetsResponse.body.fungibleTokens);
        // setNanoErg(BigInt(assetsResponse.body.nanoErg));
      } else {
        console.error('Failed to fetch assets for profile');
        throw new Error('FAILED_ASSETS_FETCH');
      }
    };

    const fetchHistory = async (): Promise<void> => {
      const historyResponse = await backendRequest(
        `/user/history?address=${props.profileAddress}`,
        'GET'
      );
      if (historyResponse.status === 200) {
        setHistory(historyResponse.body);
      } else {
        console.error('Failed to fetch history for profile');
        throw new Error('FAILED_HISTORY_FETCH');
      }
    };

    const fetchTabsData = async (): Promise<void> => {
      await Promise.all([fetchAssets(), fetchHistory()]);
      setIsLoaded(true);
    };

    fetchTabsData().catch(console.error);
  }, [isLoaded]);

  return (
    <FlexDiv style={{ width: '100%' }}>
      <ProfileTabsWrapper>
        <ProfileTab
          isSelected={selectedTab === 'NFT'}
          onClick={() => {
            setSelectedTab('NFT');
          }}
        >
          <TabText>NFT</TabText>
        </ProfileTab>
        <ProfileTab
          isSelected={selectedTab === 'Fungible'}
          onClick={() => {
            setSelectedTab('Fungible');
          }}
        >
          <TabText>Fungible</TabText>
        </ProfileTab>
        <ProfileTab
          isSelected={selectedTab === 'History'}
          onClick={() => {
            setSelectedTab('History');
          }}
        >
          <TabText>History</TabText>
        </ProfileTab>
      </ProfileTabsWrapper>
      <Spacer size={spacing.spacing_m} vertical />

      {selectedTab === 'NFT' && <NftList rawNfts={rawNfts} />}
      {selectedTab === 'Fungible' && (
        <FungibleList rawFungibles={rawFungibles} />
      )}
      {selectedTab === 'History' && (
        <SwapHistory userAddr={props.profileAddress} history={history} />
      )}
    </FlexDiv>
  );
};
