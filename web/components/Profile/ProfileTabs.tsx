import { useEffect, useState } from 'react';
import { FlexDiv } from '@components/Common/Alignment';
import styled from 'styled-components';
import { Text } from '@components/Common/Text';
import { FungibleList } from '@components/Profile/FungibleList';
import { NftList } from '@components/Profile/NftList';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { type FungibleToken, type Nft } from '@components/Swap/types';
import { backendRequest, explorerRequest } from '@utils/utils';
import {
  type FungibleStats,
  type NftStats,
  type Swap,
} from '@components/Profile/types';
import { SwapHistory } from '@components/Profile/SwapHistory';
import { loadNftImageUrl } from '@utils/imageLoader';
import { Statistics } from '@components/Profile/Statistics';
import { type ProfileInfo } from '@data-types/profile';
import { Follows } from '@components/Profile/Follows';

type Tabs = 'NFT' | 'Fungible' | 'History' | 'Statistics' | 'Follows';

const ProfileTabsWrapper = styled(FlexDiv)`
  width: 100%;
  border-bottom: ${(props) => {
    return `1px solid ${props.theme.properties.colorBgText}`;
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
  const [selectedTab, setSelectedTab] = useState<Tabs>('NFT');
  const [rawNfts, setRawNfts] = useState<Nft[] | undefined>(undefined);
  const [rawFungibles, setRawFungibles] = useState<FungibleToken[] | undefined>(
    undefined
  );
  const [nanoErg, setNanoErg] = useState<bigint | undefined>(undefined);
  const [history, setHistory] = useState<Swap[] | undefined>(undefined);
  const [nftStats, setNftStats] = useState<NftStats[] | undefined>(undefined);
  const [fungibleStats, setFungibleStats] = useState<
    FungibleStats[] | undefined
  >(undefined);
  // const [nanoErg, setNanoErg] = React.useState<bigint | undefined>(undefined);
  const [follows, setFollows] = useState<ProfileInfo[] | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const fetchAssets = async (): Promise<void> => {
      const assetsResponse = await backendRequest(
        `/user/assets?address=${props.profileAddress}`,
        'GET'
      );
      if (assetsResponse.status === 200) {
        setRawNfts(assetsResponse.body.nfts);
        setRawFungibles(assetsResponse.body.fungibleTokens);
        setNanoErg(BigInt(assetsResponse.body.nanoErg));
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

    const fetchStats = async (): Promise<void> => {
      const statsResponse = await backendRequest(
        `/user/stats?address=${props.profileAddress}`,
        'GET'
      );
      const fetchedNftStats: NftStats[] = [];
      const fetchedFungibleStats: FungibleStats[] = [];
      if (statsResponse.status === 200 && statsResponse.body !== undefined) {
        for (const asset of statsResponse.body) {
          const assetInfo = await explorerRequest(`/tokens/${asset.token_id}`);
          const stats = {
            amountBought: BigInt(asset.amount_bought),
            amountSold: BigInt(asset.amount_sold),
          };

          if (assetInfo.emissionAmount === 1) {
            // NFT
            const maybeNftImgUrl = await loadNftImageUrl(asset.token_id);
            fetchedNftStats.push({
              nft: {
                tokenId: asset.token_id,
                name: assetInfo.name,
                imageUrl: maybeNftImgUrl,
              },
              stats,
            });
          } else {
            // Fungible token
            fetchedFungibleStats.push({
              fungibleToken: {
                tokenId: asset.token_id,
                name: assetInfo.name,
                decimals: assetInfo.decimals,
              },
              stats,
            });
          }
        }
      }
      setNftStats(fetchedNftStats);
      setFungibleStats(fetchedFungibleStats);
    };

    const fetchFollows = async (): Promise<void> => {
      const followsResponse = await backendRequest(
        `/user/follow?fromAddress=${props.profileAddress}`,
        'GET'
      );
      if (followsResponse.status === 200) {
        setFollows(followsResponse.body);
      } else {
        console.error('Failed to fetch follows for profile');
        throw new Error('FAILED_FOLLOWS_FETCH');
      }
    };

    const fetchTabsData = async (): Promise<void> => {
      await Promise.all([
        fetchAssets(),
        fetchHistory(),
        fetchStats(),
        fetchFollows(),
      ]);
      setIsLoaded(true);
    };

    fetchTabsData().catch(console.error);
  }, [isLoaded, props.profileAddress]);

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

        <ProfileTab
          isSelected={selectedTab === 'Statistics'}
          onClick={() => {
            setSelectedTab('Statistics');
          }}
        >
          <TabText>Statistics</TabText>
        </ProfileTab>

        <ProfileTab
          isSelected={selectedTab === 'Follows'}
          onClick={() => {
            setSelectedTab('Follows');
          }}
        >
          <TabText>Follows</TabText>
        </ProfileTab>
      </ProfileTabsWrapper>
      <Spacer size={spacing.spacing_m} vertical />

      {selectedTab === 'NFT' && <NftList rawNfts={rawNfts} />}
      {selectedTab === 'Fungible' && (
        <FungibleList
          rawFungibles={rawFungibles}
          nanoErg={nanoErg ?? BigInt(0)}
        />
      )}
      {selectedTab === 'History' && (
        <SwapHistory userAddr={props.profileAddress} history={history} />
      )}
      {selectedTab === 'Statistics' && (
        <Statistics
          userAddr={props.profileAddress}
          nftStats={nftStats ?? []}
          fungibleStats={fungibleStats ?? []}
        />
      )}
      {selectedTab === 'Follows' && <Follows follows={follows} />}
    </FlexDiv>
  );
};
