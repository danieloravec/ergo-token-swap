import { Heading1, LargeInput } from '@components/Common/Text';
import { FlexDiv, FlexDivRow } from '@components/Common/Alignment';
import React, { useEffect } from 'react';
import { Alert } from '@components/Common/Alert';
import styled from 'styled-components';
import { ButtonSecondary } from '@components/Common/Button';
import { backendRequest } from '@utils/utils';
import { useWalletStore } from '@components/Wallet/hooks';

const EditProfileFormContainer = styled.div`
  width: 100%;
  @media (min-width: 600px) {
    width: 80%;
  }
  @media (min-width: 1000px) {
    width: 50%;
  }
`;

const FormAlert = styled(Alert)`
  margin-left: 0;
`;

export const EditProfileForm = (): JSX.Element => {
  const { address } = useWalletStore();

  const [displayFormAlerts, setDisplayFormAlerts] = React.useState(false);
  const [discord, setDiscord] = React.useState<string | undefined>(undefined);
  const [discordError, setDiscordError] = React.useState<string | undefined>(
    undefined
  );
  const [username, setUsername] = React.useState<string | undefined>(undefined);
  const [usernameError, setUsernameError] = React.useState<string | undefined>(
    undefined
  );
  const [twitter, setTwitter] = React.useState<string | undefined>(undefined);
  const [twitterError, setTwitterError] = React.useState<string | undefined>(
    undefined
  );
  const [isMounted, setIsMounted] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<
    { message: string; type: 'success' | 'error' } | undefined
  >(undefined);

  useEffect(() => {
    console.log(`address: ${address}`);
    setIsMounted(true);
  });

  useEffect(() => {
    (async () => {
      if (!isMounted || address === undefined) {
        return;
      }
      const profileInfo = await backendRequest(
        `/user?address=${address}`,
        'GET'
      );
      if (profileInfo?.status === 200) {
        console.log(JSON.stringify(profileInfo));
        setDiscord(profileInfo.body?.discord);
        setUsername(profileInfo.body?.username);
        setTwitter(profileInfo.body?.twitter);
      }
    })().catch(console.error);
  }, [isMounted, address]);

  const handleDiscordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setDisplayFormAlerts(false);
    const discordValue = event.target.value;
    setDiscord(event.target.value);
    if (/^[^#]{2,32}#\d{4}$/.test(discordValue)) {
      setDiscordError(undefined);
    } else {
      setDiscordError(
        'Discord name invalid. Expected a value like joseph#1234.'
      );
    }
  };

  const handleUsernameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setDisplayFormAlerts(false);
    const usernameValue = event.target.value;
    setUsername(usernameValue);
    if (/^[a-zA-Z0-9_]{2,32}$/.test(usernameValue)) {
      setUsernameError(undefined);
    } else {
      setUsernameError(
        'Invalid username. It can only use letters, digits and underscores. It has to be between 2 and 32 characters long.'
      );
    }
  };

  const handleTwitterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setDisplayFormAlerts(false);
    const twitterValue = event.target.value;
    setTwitter(twitterValue);
    if (/^[a-zA-Z0-9_]{1,15}$/.test(twitterValue)) {
      setTwitterError(undefined);
    } else {
      setTwitterError(
        'Invalid Twitter username. Please only fill the username without the twitter.com part.'
      );
    }
  };

  const handleSave = (): void => {
    if (
      usernameError !== undefined ||
      discordError !== undefined ||
      twitterError !== undefined
    ) {
      setDisplayFormAlerts(true);
      return;
    }
    const submitData = async (): Promise<void> => {
      const body = {
        address,
        discord,
        twitter,
        username,
        signature: 'DUMMY_SIGNATURE',
      }; // TODO add email
      try {
        const response = await backendRequest('/user', 'POST', body);
        if (response?.status !== 200) {
          setSaveMessage({
            message: `Error saving profile: ${response.message}`,
            type: 'error',
          });
        } else {
          setSaveMessage({
            message: 'Profile saved successfully.',
            type: 'success',
          });
        }
      } catch (err) {
        setSaveMessage({
          message: `Unexpected error: ${JSON.stringify(err)}`,
          type: 'error',
        });
      }
    };
    submitData().catch(console.error);
  };

  return (
    <EditProfileFormContainer>
      <Heading1 style={{ width: '100%' }}>EDIT PROFILE</Heading1>
      {saveMessage !== undefined && (
        <FormAlert type={saveMessage.type} marginSides="0px">
          {saveMessage.message}
        </FormAlert>
      )}
      <FlexDiv>
        <FlexDivRow>
          {displayFormAlerts && usernameError !== undefined && (
            <FormAlert type="error" marginSides="0px">
              {usernameError}
            </FormAlert>
          )}
          <LargeInput
            type="text"
            placeholder="Username"
            onChange={handleUsernameChange}
            value={typeof username === 'string' ? username : ''}
          />
        </FlexDivRow>
        <FlexDivRow>
          {displayFormAlerts && discordError !== undefined && (
            <FormAlert type="error" marginSides="0px">
              {discordError}
            </FormAlert>
          )}
          <LargeInput
            type="text"
            placeholder="Discord handle"
            onChange={handleDiscordChange}
            value={typeof discord === 'string' ? discord : ''}
          />
        </FlexDivRow>
        <FlexDivRow>
          {displayFormAlerts && twitterError !== undefined && (
            <FormAlert type="error" marginSides="0px">
              {twitterError}
            </FormAlert>
          )}
          <LargeInput
            type="text"
            placeholder="Twitter handle"
            onChange={handleTwitterChange}
            value={typeof twitter === 'string' ? twitter : ''}
          />
        </FlexDivRow>
        <ButtonSecondary style={{ width: '100%' }} onClick={handleSave}>
          Save
        </ButtonSecondary>
      </FlexDiv>
    </EditProfileFormContainer>
  );
};
