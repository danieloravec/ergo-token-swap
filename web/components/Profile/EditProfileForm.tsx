import { Heading1, Input } from '@components/Common/Text';
import { FlexDiv, FlexDivRow } from '@components/Common/Alignment';
import { spacing } from '@themes/spacing';
import React, { useEffect } from 'react';
import { Alert } from '@components/Common/Alert';
import styled from 'styled-components';
import { ButtonSecondary } from '@components/Common/Button';
import { backendRequest } from '@utils/utils';
import { useWalletStore } from '@components/Wallet/hooks';

const EditProfileFormContainer = styled.div`
  width: 100%;
  @media (min-width: 600px) {
    width: 50%;
  }
  @media (min-width: 1000px) {
    width: 30%;
  }
`;

const LargeInput = styled(Input)`
  font-size: 24px;
  width: 100%;
  margin-bottom: ${() => `${spacing.spacing_xs}px`};
  height: 50px;
  border-radius: 5px;
`;

export const EditProfileForm = (): JSX.Element => {
  const { address } = useWalletStore();

  const [displayAlerts, setDisplayAlerts] = React.useState(false);
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
    setDisplayAlerts(false);
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
    setDisplayAlerts(false);
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
    setDisplayAlerts(false);
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
      setDisplayAlerts(true);
      return;
    }
    console.log('Not implemented');
    // const submitData = async () => {
    //   const body = {
    //     address: address,
    //     discord: discord,
    //     twitter: twitter,
    //     username: username,
    //     signature: "DUMMY_SIGNATURE"
    //   }
    //   const response = await backendRequest("POST", "/user", body);
    // }
  };

  return (
    <EditProfileFormContainer>
      <Heading1 style={{ width: '100%' }}>EDIT PROFILE</Heading1>
      <FlexDiv>
        <FlexDivRow>
          {displayAlerts && usernameError !== undefined && (
            <Alert type="error">{usernameError}</Alert>
          )}
          <LargeInput
            type="text"
            placeholder="Username"
            onChange={handleUsernameChange}
            value={typeof username === 'string' ? username : ''}
          />
        </FlexDivRow>
        <FlexDivRow>
          {displayAlerts && discordError !== undefined && (
            <Alert type="error">{discordError}</Alert>
          )}
          <LargeInput
            type="text"
            placeholder="Discord handle"
            onChange={handleDiscordChange}
            value={typeof discord === 'string' ? discord : ''}
          />
        </FlexDivRow>
        <FlexDivRow>
          {displayAlerts && twitterError !== undefined && (
            <Alert type="error">{twitterError}</Alert>
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
