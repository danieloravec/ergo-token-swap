import { Heading1, Input, Text } from '@components/Common/Text';
import {
  CenteredDiv,
  CenteredDivHorizontal,
  CenteredDivVertical,
  FlexDiv,
} from '@components/Common/Alignment';
import { useState } from 'react';
import { ButtonSecondary } from '@components/Common/Button';
import { backendRequest } from '@utils/utils';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import styled from 'styled-components';
import { ProfileHeader } from '@components/Profile/ProfileHeader';
import { type ProfileInfo } from '@data-types/profile';

const TokenIdInput = styled(Input)`
  width: 100%;
  min-height: 50px;
  font-size: 16px;
`;

const HoldersSearchForm = (props: {
  onResultsFound: (results: ProfileInfo[]) => void;
}): JSX.Element => {
  const [tokenId, setTokenId] = useState('');

  const handleSubmit = (): void => {
    const getHolders = async (): Promise<void> => {
      const holdersResponse = await backendRequest(
        `/holder?tokenId=${tokenId}`
      );
      if (holdersResponse.status !== 200) {
        console.error(
          `Error getting holders: ${JSON.stringify(holdersResponse)}`
        );
      }
      props.onResultsFound(holdersResponse.body);
    };
    getHolders().catch(console.error);
  };

  return (
    <CenteredDivHorizontal style={{ width: '100%' }}>
      <CenteredDivVertical style={{ height: '100%' }}>
        <Text>Token ID: </Text>
      </CenteredDivVertical>

      <Spacer size={spacing.spacing_xs} vertical={false} />

      <FlexDiv style={{ width: '50%' }}>
        <TokenIdInput
          type="text"
          onChange={(e) => {
            setTokenId(e.target.value);
          }}
          placeholder="4f3e6736dfa5bd7d4e08454177fdb7ec455f9d93059a3a76cdd2df52e0ade602"
        />
      </FlexDiv>

      <Spacer size={spacing.spacing_xs} vertical={false} />

      <FlexDiv>
        <ButtonSecondary onClick={handleSubmit}>Search</ButtonSecondary>
      </FlexDiv>
    </CenteredDivHorizontal>
  );
};

const HoldersListEntryContainer = styled(FlexDiv)`
  padding: ${() => `${spacing.spacing_xxs}px`};
  margin-bottom: ${() => `${spacing.spacing_xxs}px`};
  border: 1px solid black;
  border-radius: 10px;
  min-height: 80px;
`;

const HoldersList = (props: { holders: ProfileInfo[] }): JSX.Element => {
  return (
    <FlexDiv style={{ width: '60%' }}>
      {props.holders.map((holder: ProfileInfo) => {
        return (
          <HoldersListEntryContainer
            style={{ width: '100%' }}
            key={holder.address}
          >
            <ProfileHeader data={holder} />
          </HoldersListEntryContainer>
        );
      })}
    </FlexDiv>
  );
};

const FindHolders = (): JSX.Element => {
  const [holders, setHolders] = useState<ProfileInfo[] | undefined>(undefined);

  return (
    <CenteredDiv>
      <Heading1>FIND TOKENS OWNER CONTACT INFO</Heading1>

      <HoldersSearchForm
        onResultsFound={(results: ProfileInfo[]) => {
          setHolders(results);
        }}
      />

      <Spacer size={spacing.spacing_m} vertical />

      {holders !== undefined && <HoldersList holders={holders} />}
    </CenteredDiv>
  );
};

export default FindHolders;
