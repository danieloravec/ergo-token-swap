import React from 'react';
import { FlexDiv } from '@components/Common/Alignment';
import styled from 'styled-components';
import { Text } from '@components/Common/Text';
import { FungibleList } from '@components/Profile/FungibleList';
import { NftList } from '@components/Profile/NftList';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';

type Tabs = 'NFT' | 'Fungible';

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

  return (
    <FlexDiv>
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
      </ProfileTabsWrapper>
      <Spacer size={spacing.spacing_m} vertical />

      {selectedTab === 'NFT' ? (
        <NftList targetAddress={props.profileAddress} />
      ) : (
        <FungibleList />
      )}
    </FlexDiv>
  );
};
