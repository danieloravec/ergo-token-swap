import {
  CenteredDivHorizontal,
  CenteredDivVertical,
} from '@components/Common/Alignment';
import { Heading1, TextPrimaryWrapper } from '@components/Common/Text';
import { Hourglass } from '@components/Icons/Hourglass';
import React from 'react';
import WaitingPhaseGuide from '@components/Swap/WaitingPhaseGuide';
import { useTheme } from 'styled-components';

const WaitingScreen = (props: { tradingSessionId: string }): JSX.Element => {
  const theme = useTheme();

  return (
    <CenteredDivVertical>
      <CenteredDivHorizontal>
        <Heading1>
          Welcome to trading room #
          <TextPrimaryWrapper>{props.tradingSessionId}</TextPrimaryWrapper>!
        </Heading1>
      </CenteredDivHorizontal>
      <CenteredDivHorizontal>
        <WaitingPhaseGuide />
      </CenteredDivHorizontal>
      <CenteredDivHorizontal>
        <Hourglass width={128} height={128} fill={theme.properties.colorBg} />
      </CenteredDivHorizontal>
    </CenteredDivVertical>
  );
};

export default WaitingScreen;
