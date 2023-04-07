import React from 'react';
import { CenteredDiv, Div } from '@components/Common/Alignment';
import { EditProfileForm } from '@components/Profile/EditProfileForm';

export default function EditProfile(): JSX.Element {
  return (
    <Div>
      <CenteredDiv>
        <EditProfileForm />
      </CenteredDiv>
    </Div>
  );
}
