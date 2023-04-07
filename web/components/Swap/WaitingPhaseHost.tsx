import { useTheme } from 'styled-components';
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
  FlexDiv,
} from '@components/Common/Alignment';

export function WaitingPhaseHost(props: {
  guestIsReady: boolean; // Do not remove guestInfo prop, it is for automatic reload
}): JSX.Element {
  const theme = useTheme();
  return (
    <FlexDiv>
      <CenteredDivVertical>
        <CenteredDivHorizontal>
          <Heading1>Welcome to your trading room!</Heading1>
        </CenteredDivHorizontal>
        <CenteredDivHorizontal>
          <Text>
            Please send this link to the other party and wait for them to join:
          </Text>
        </CenteredDivHorizontal>
        <CenteredDivHorizontal>
          <Heading3>
            <TextPrimaryWrapper>{window.location.href}</TextPrimaryWrapper>
          </Heading3>
        </CenteredDivHorizontal>
        <CenteredDivHorizontal>
          <Hourglass width={128} height={128} fill={theme.properties.colorBg} />
        </CenteredDivHorizontal>
      </CenteredDivVertical>
    </FlexDiv>
  );
}
