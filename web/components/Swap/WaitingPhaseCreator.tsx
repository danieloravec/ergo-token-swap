import { useTheme, ThemeProvider } from 'styled-components';
import {
  Heading1,
  Heading3,
  Text,
  TextPrimaryWrapper,
} from '@components/Common/Text';
import { Hourglass } from '@components/Icons/Hourglass';
import React, { useEffect } from 'react';
import {
  CenteredDivHorizontal,
  CenteredDivVertical,
  MainSectionDiv,
} from '@components/Common/Alignment';
import { backendRequest } from '@utils/utils';
import { useRouter } from 'next/router';

export function WaitingPhaseCreator(props: {
  tradingSessionId: string;
}): JSX.Element {
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    const tryFetchGuestInfo = async (): Promise<void> => {
      let foundGuestInfo = false;
      while (!foundGuestInfo) {
        try {
          const sessionInfoResponse = await backendRequest(
            `/session/info?secret=${props.tradingSessionId}`,
            'GET'
          );
          if (sessionInfoResponse.status !== 200) {
            console.error('Failed to get session info');
          }
          if (sessionInfoResponse?.body?.guest !== undefined) {
            foundGuestInfo = true;
          }
        } catch (err) {
          console.error(err);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      router.reload();
    };
    tryFetchGuestInfo().catch(console.error);
  });

  return (
    <ThemeProvider theme={theme}>
      <MainSectionDiv>
        <CenteredDivVertical>
          <CenteredDivHorizontal>
            <Heading1>Welcome to your trading room!</Heading1>
          </CenteredDivHorizontal>
          <CenteredDivHorizontal>
            <Text>
              Please send this link to the other party and wait for them to
              join:
            </Text>
          </CenteredDivHorizontal>
          <CenteredDivHorizontal>
            <Heading3>
              <TextPrimaryWrapper>{window.location.href}</TextPrimaryWrapper>
            </Heading3>
          </CenteredDivHorizontal>
          <CenteredDivHorizontal>
            <Hourglass
              width={128}
              height={128}
              fill={theme.properties.colorBg}
            />
          </CenteredDivHorizontal>
        </CenteredDivVertical>
      </MainSectionDiv>
    </ThemeProvider>
  );
}
