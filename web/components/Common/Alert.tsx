import styled from 'styled-components';
import React, { type ReactNode, useState } from 'react';
import { type AlertType } from '@themes/themes';
import { TextNavs } from '@components/Common/Text';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { Div } from '@components/Common/Alignment';

const AlertBody = styled.div<{ type: string; marginSides?: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 10px);
  min-height: 50px;
  margin: ${(props) => {
    const sideMargin =
      props.marginSides !== undefined ? props.marginSides : '10px';
    return `10px ${sideMargin} 10px ${sideMargin}`;
  }};
  padding: 10px;
  border-radius: 5px;
  background-color: ${(props) =>
    props.theme.properties.alertColors[props.type as AlertType]};
`;

const PointerOnHover = styled.div`
  &:hover {
    cursor: pointer;
  }
`;

export const Alert = (props: {
  type: AlertType;
  children: ReactNode;
  marginSides?: string;
}): JSX.Element => {
  const [hide, setHide] = useState<boolean>(false);
  if (hide) {
    return <></>;
  }
  return (
    <AlertBody type={props.type} marginSides={props.marginSides}>
      <TextNavs>
        <strong>{props.children}</strong>
      </TextNavs>
      <Div>
        <PointerOnHover
          onClick={() => {
            setHide(true);
          }}
        >
          ×
        </PointerOnHover>
        <Spacer size={spacing.spacing_xs} vertical={false} />
      </Div>
    </AlertBody>
  );
};
