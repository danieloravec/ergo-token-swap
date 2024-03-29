import { useState } from 'react';
import { TextSecondaryWrapper } from '@components/Common/Text';
import styled from 'styled-components';
import { CenteredDiv, FlexDiv } from '@components/Common/Alignment';

const ToggleHalf = styled(CenteredDiv)<{ side: string }>`
  border-radius: ${(props) =>
    props.side === 'left' ? '30px 0 0 30px' : '0 30px 30px 0'};
  background: ${(props) => props.theme.properties.colorExtras};
  color: ${(props) => props.theme.properties.colorNavsText};
  align-content: center;
  width: 80px;
  height: 30px;
  margin: 1px;
`;

export function Toggle(props: {
  leftOption: string;
  rightOption: string;
  selected?: 'left' | 'right';
  onToggle: (toggledToSide: 'left' | 'right') => void;
}): JSX.Element {
  const [leftOptionSelected, setLeftOptionSelected] = useState(
    props.selected === undefined || props.selected === 'left'
  );
  const handleClick = (clickedSide: 'left' | 'right'): void => {
    if (clickedSide === 'left') {
      if (!leftOptionSelected) {
        props.onToggle('left');
      }
      setLeftOptionSelected(true);
    } else {
      if (leftOptionSelected) {
        props.onToggle('right');
      }
      setLeftOptionSelected(false);
    }
  };
  return (
    <FlexDiv style={{ alignContent: 'center' }}>
      <ToggleHalf
        side="left"
        onClick={() => {
          handleClick('left');
        }}
      >
        {leftOptionSelected ? (
          <TextSecondaryWrapper>{props.leftOption}</TextSecondaryWrapper>
        ) : (
          props.leftOption
        )}
      </ToggleHalf>
      <ToggleHalf
        side="right"
        onClick={() => {
          handleClick('right');
        }}
      >
        {leftOptionSelected ? (
          props.rightOption
        ) : (
          <TextSecondaryWrapper>{props.rightOption}</TextSecondaryWrapper>
        )}
      </ToggleHalf>
    </FlexDiv>
  );
}
