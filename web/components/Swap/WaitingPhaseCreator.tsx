import { useTheme, ThemeProvider } from 'styled-components';
import {
  Heading1,
  Heading3,
  Text,
  TextPrimaryWrapper,
} from '@components/Common/Text';
import { Hourglass } from '@components/Icons/Hourglass';
import React from 'react';
import {
  CenteredDivHorizontal,
  CenteredDivVertical,
  MainSectionDiv,
} from '@components/Common/Alignment';

export function WaitingPhaseCreator(props: {
  tradingSessionId: string;
}): JSX.Element {
  const theme = useTheme();
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
              <TextPrimaryWrapper>
                https://ergo-token-swap.io/{props.tradingSessionId}
              </TextPrimaryWrapper>
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
