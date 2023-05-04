import { type ProfileInfo } from '@data-types/profile';
import { Text } from '@components/Common/Text';
import { CenteredDiv, FlexDiv } from '@components/Common/Alignment';
import { ProfileHeader } from '@components/Profile/ProfileHeader';
import styled from 'styled-components';
import { spacing } from '@themes/spacing';

const FolloweeEntryContainer = styled(FlexDiv)`
  width: 100%;
  padding: ${(props) => spacing.spacing_xxs};
  border: ${(props) => `1px solid ${props.theme.properties.colorNavs}`};
`;

export const Follows = (props: { follows?: ProfileInfo[] }): JSX.Element => {
  if (props.follows === undefined) {
    return (
      <CenteredDiv>
        <Text>Loading...</Text>
      </CenteredDiv>
    );
  }

  if (props.follows.length === 0) {
    return (
      <FlexDiv>
        <Text>This profile is not following anyone yet...</Text>
      </FlexDiv>
    );
  }

  return (
    <CenteredDiv style={{ width: '100%' }}>
      {props.follows.map((follow: ProfileInfo) => {
        return (
          <FolloweeEntryContainer>
            <ProfileHeader data={follow} disableFavourite />
          </FolloweeEntryContainer>
        );
      })}
    </CenteredDiv>
  );
};
