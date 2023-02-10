import styled, { useTheme, ThemeProvider } from 'styled-components';
import {
  Heading1,
  OrderedList,
  TextPrimaryWrapper,
} from '@components/Common/Text';
import { Hourglass } from '@components/Icons/Hourglass';
import React from 'react';
import {
  CenteredDivHorizontal,
  CenteredDivVertical,
  FlexDiv,
} from '@components/Common/Alignment';

const WaitingPhaseCreatorContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  height: 80vh;
  flex-direction: column;
  align-content: center;
  background: ${(props) => props.theme.properties.colorBg};
`;

function WaitingPhaseGuestGuide(): JSX.Element {
  return (
    <FlexDiv>
      <OrderedList>
        <li>Wait for the other party to select assets to swap.</li>
        <li>A wallet prompt will show up.</li>
        <li>Make sure the swap is fair.</li>
        <li>If it is, sign the transaction.</li>
      </OrderedList>
    </FlexDiv>
  );
}

export function WaitingPhaseGuest(props: {
  tradingSessionId: string;
}): JSX.Element {
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <WaitingPhaseCreatorContainer>
        <CenteredDivVertical>
          <CenteredDivHorizontal>
            <Heading1>
              Welcome to trading room #
              <TextPrimaryWrapper>{props.tradingSessionId}</TextPrimaryWrapper>!
            </Heading1>
          </CenteredDivHorizontal>
          <CenteredDivHorizontal>
            <WaitingPhaseGuestGuide />
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
