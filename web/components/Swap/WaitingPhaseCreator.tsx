import styled, { useTheme, ThemeProvider } from 'styled-components';
import {
  Heading1,
  Heading3,
  Paragraph,
  TextPrimaryWrapper,
} from '@components/Common/Text';
import { Hourglass } from '@components/Icons/Hourglass';
import React from 'react';
import {
  CenteredDivHorizontal,
  CenteredDivVertical,
} from '@components/Common/Alignment';

const WaitingPhaseCreatorContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  height: 80vh;
  flex-direction: column;
  align-content: center;
  background: ${(props) => props.theme.properties.colorBg};
`;

export function WaitingPhaseCreator(props: {
  tradingSessionId: string;
}): JSX.Element {
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <WaitingPhaseCreatorContainer>
        <CenteredDivVertical>
          <CenteredDivHorizontal>
            <Heading1>Welcome to your trading room!</Heading1>
          </CenteredDivHorizontal>
          <CenteredDivHorizontal>
            <Paragraph>
              Please send this link to the other party and wait for them to
              join:
            </Paragraph>
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
      </WaitingPhaseCreatorContainer>
    </ThemeProvider>
  );
}
