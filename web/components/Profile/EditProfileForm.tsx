import { Heading1, Text, Input } from '@components/Common/Text';
import { BreakRow, FlexDiv } from '@components/Common/Alignment';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import React from 'react';
import { Alert } from '@components/Common/Alert';
import styled from 'styled-components';

const EditProfileFormContainer = styled.div`
  width: 100%;
  @media (min-width: 600px) {
    width: 50%;
  }
  @media (min-width: 1000px) {
    width: 30%;
  }
`;

const LabelText = styled(Text)`
  width: 150px;
`;

const BreakFormRow = styled(BreakRow)`
  height: ${() => `${spacing.spacing_xs}px`};
`;

export const EditProfileForm = (): JSX.Element => {
  const [validationError, setValidationError] = React.useState<
    string | undefined
  >(undefined);
  const [discord, setDiscord] = React.useState<string | undefined>(undefined);
  const [username, setUsername] = React.useState<string | undefined>(undefined);
  const [twitter, setTwitter] = React.useState<string | undefined>(undefined);

  const handleDiscordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setDiscord(event.target.value);
  };

  const handleUsernameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setUsername(event.target.value);
  };

  const handleTwitterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const usernameValue = event.target.value;
    if (/^[a-zA-Z0-9_]{1,15}$/.test(usernameValue)) {
      setTwitter(event.target.value);
    } else {
      setValidationError(
        'Invalid Twitter username. Please only fill the username without the twitter.com/... part.'
      );
    }
  };

  return (
    <EditProfileFormContainer>
      <Heading1 style={{ width: '100%' }}>EDIT PROFILE</Heading1>
      {validationError !== undefined && (
        <Alert type="error">{validationError}</Alert>
      )}
      <FlexDiv>
        <FlexDiv>
          <LabelText>Username:</LabelText>
          <Spacer size={spacing.spacing_xs} vertical={false} />
          <Input type="text" onChange={handleUsernameChange} value={username} />
        </FlexDiv>
        <BreakFormRow />
        <FlexDiv>
          <LabelText>Discord:</LabelText>
          <Spacer size={spacing.spacing_xs} vertical={false} />
          <Input type="text" onChange={handleDiscordChange} value={discord} />
        </FlexDiv>
        <BreakFormRow />
        <FlexDiv>
          <LabelText>Twitter:</LabelText>
          <Spacer size={spacing.spacing_xs} vertical={false} />
          <Input type="text" onChange={handleTwitterChange} value={twitter} />
        </FlexDiv>
      </FlexDiv>
    </EditProfileFormContainer>
  );
};
