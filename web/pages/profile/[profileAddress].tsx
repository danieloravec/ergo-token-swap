import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FlexDiv } from '@components/Common/Alignment';
import { backendRequest, createUserIfNotExists } from '@utils/utils';
import { ProfileHeader } from '@components/Profile/ProfileHeader';
import { type ProfileInfo } from '@data-types//profile';
import { NotFoundPage } from '@components/Common/NotFoundPage';
import { ProfileTabs } from '@components/Profile/ProfileTabs';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';

export default function Profile(): JSX.Element {
  const router = useRouter();
  const { profileAddress } = router.query;
  const [isReady, setIsReady] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [profileInfo, setProfileInfo] = useState<ProfileInfo | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchProfileInfoMaybeCreate = async (): Promise<void> => {
      if (profileAddress === undefined) {
        return;
      }
      const profileInfoResponse = await backendRequest(
        `/user?address=${profileAddress}`
      );
      if (profileInfoResponse.status !== 200) {
        if (profileInfoResponse.body.message === 'User not found') {
          const userInfo = await createUserIfNotExists(
            profileAddress as string
          );
          if (userInfo === undefined) {
            setIsValid(false);
            return;
          }
          setProfileInfo(userInfo);
        } else {
          console.error(profileInfoResponse);
          setIsValid(false);
          return;
        }
      } else {
        setProfileInfo(profileInfoResponse.body as ProfileInfo);
      }
      setIsValid(true);
      setIsReady(true);
    };
    fetchProfileInfoMaybeCreate().catch(console.error);
  }, [profileAddress]);

  if (!isReady) {
    return <div>Loading...</div>;
  }

  if (
    profileInfo === undefined ||
    typeof profileAddress !== 'string' ||
    !isValid
  ) {
    return <NotFoundPage />;
  }

  return (
    <FlexDiv style={{ width: '80%' }}>
      <ProfileHeader data={profileInfo} />
      <Spacer size={spacing.spacing_m} vertical />
      <ProfileTabs profileAddress={profileAddress} />
    </FlexDiv>
  );
}
