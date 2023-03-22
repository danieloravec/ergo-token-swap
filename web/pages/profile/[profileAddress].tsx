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
    const fetchProfileInfo = async (): Promise<void> => {
      if (profileAddress === undefined) {
        return;
      }
      console.log(`profileAddress: ${profileAddress}`);
      const profileInfoResponse = await backendRequest(
        `/user?address=${profileAddress}`
      );
      if (profileInfoResponse.status !== 200) {
        console.error(profileInfoResponse);
        setIsValid(false);
      } else {
        setIsValid(true);
        setProfileInfo(profileInfoResponse.body as ProfileInfo);
      }
      setIsReady(true);
    };
    fetchProfileInfo().catch(console.error);
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
