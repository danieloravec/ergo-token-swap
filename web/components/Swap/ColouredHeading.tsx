import styled from 'styled-components';

const ColouredHeading = styled.div<{ width?: number }>`
  height: 40px;
  width: ${(props) =>
    props.width !== undefined ? `${props.width}px` : '100%'};
  background: ${(props) => props.theme.properties.colorSecondary};
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  position: relative;
  align-content: center;
`;

export default ColouredHeading;
