import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Div, MainSectionDiv } from '@components/Common/Alignment';
import { LoadingPage } from '@components/Common/LoadingPage';
import { backendRequest } from '@utils/utils';
import { ProfileHeader } from '@components/Profile/ProfileHeader';
import { type ProfileInfo } from '@data-types//profile';
import { Nav } from '@components/Nav/Nav';
import { Footer } from '@components/Footer/Footer';

export default function Profile(): JSX.Element {
  const router = useRouter();
  const { profileAddress } = router.query;
  const [isReady, setIsReady] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [profileInfo, setProfileInfo] = useState<ProfileInfo | undefined>(
    undefined
  );

  useEffect(() => {
    setIsReady(true);
  });

  useEffect(() => {
    const fetchProfileInfoMaybeCreate = async (): Promise<void> => {
      if (profileAddress === undefined) {
        return;
      }
      const profileInfoResponse = await backendRequest(
        `/user?address=${profileAddress}`
      );
      if (profileInfoResponse.status !== 200) {
        if (profileInfoResponse.body === 'User not found') {
          const userCreateBody = {
            address: profileAddress,
          };
          const userCreateResponse = await backendRequest(
            '/user',
            'POST',
            userCreateBody
          );
          if (userCreateResponse.status !== 200) {
            console.error(JSON.stringify(userCreateResponse));
            setIsValid(false);
            return;
          }
          setProfileInfo(userCreateResponse.body as ProfileInfo);
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

  if (
    !isReady ||
    profileInfo === undefined ||
    typeof profileAddress !== 'string' ||
    !isValid
  ) {
    return <LoadingPage />;
  }

  return (
    <Div>
      <Nav />
      <MainSectionDiv>
        <ProfileHeader data={profileInfo} />
      </MainSectionDiv>
      <Footer />
    </Div>
  );
}
