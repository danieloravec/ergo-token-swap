import { type ProfileInfo } from '@data-types/profile';
import { Text } from '@components/Common/Text';
import { CenteredDiv, FlexDiv } from '@components/Common/Alignment';
import { ProfileHeader } from '@components/Profile/ProfileHeader';
import styled from 'styled-components';
import { spacing } from '@themes/spacing';
import { useRouter } from 'next/router';

const FolloweeEntryContainer = styled(FlexDiv)`
  width: 100%;
  padding: ${(props) => spacing.spacing_xxs};
  border: ${(props) => `1px solid ${props.theme.properties.colorNavs}`};
`;

export const Follows = (props: { follows?: ProfileInfo[] }): JSX.Element => {
  const router = useRouter();

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
            <ProfileHeader
              data={follow}
              disableFavourite
              onNameClick={() => {
                const redirectToProfile = async (): Promise<void> => {
                  await router.push(`/profile/${follow.address}`);
                };
                redirectToProfile().catch(console.error);
              }}
            />
          </FolloweeEntryContainer>
        );
      })}
    </CenteredDiv>
  );
};
