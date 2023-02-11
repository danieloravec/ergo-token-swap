import { useState } from 'react';
import { TextSecondaryWrapper } from '@components/Common/Text';
import styled, { ThemeProvider, useTheme } from 'styled-components';
import { CenteredDivHorizontal } from '@components/Common/Alignment';

const ToggleHalf = styled(CenteredDivHorizontal)<{ side: string }>`
  border-radius: ${(props) =>
    props.side === 'left' ? '30px 0 0 30px' : '0 30px 30px 0'};
  background: ${(props) => props.theme.properties.colorNavs};
  display: flex;
  align-content: center;
  width: 80px;
  height: 30px;
  margin: 1px;
`;

const ToggleContainer = styled.div`
  display: flex;
`;

export function Toggle(props: {
  leftOption: string;
  rightOption: string;
  onToggle: (toggledToSide: 'left' | 'right') => void;
}): JSX.Element {
  const [leftOptionSelected, setLeftOptionSelected] = useState(true);
  const theme = useTheme();
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
    <ThemeProvider theme={theme}>
      <ToggleContainer>
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
      </ToggleContainer>
    </ThemeProvider>
  );
}
