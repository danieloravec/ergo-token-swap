import styled from 'styled-components';

interface SpacerProps {
  vertical: boolean;
  size: number;
}

export const Spacer = styled.div`
  display: flex;
  width: ${(props: SpacerProps) =>
    props.vertical ? '1px' : `${props.size}px`};
  height: ${(props: SpacerProps) =>
    props.vertical ? `${props.size}px` : '1px'};
`;
