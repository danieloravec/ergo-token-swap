import React from 'react';
import { Nav } from '@components/Nav/Nav';
import { CenteredDiv, Div, MainSectionDiv } from '@components/Common/Alignment';
import { Footer } from '@components/Footer/Footer';
import { EditProfileForm } from '@components/Profile/EditProfileForm';

export default function EditProfile(): JSX.Element {
  return (
    <Div>
      <Nav />
      <MainSectionDiv>
        <CenteredDiv>
          <EditProfileForm />
        </CenteredDiv>
      </MainSectionDiv>
      <Footer />
    </Div>
  );
}
