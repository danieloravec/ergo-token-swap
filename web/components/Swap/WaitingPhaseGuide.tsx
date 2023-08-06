import { FlexDiv } from '@components/Common/Alignment';
import { OrderedList } from '@components/Common/Text';
import React from 'react';

function WaitingPhaseGuide(): JSX.Element {
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

export default WaitingPhaseGuide;
