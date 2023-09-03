import styled from 'styled-components';

export const Select = styled.select`
  background: ${(props) => props.theme.properties.colorBg};
  color: ${(props) => props.theme.properties.colorBgText};
  height: 50px;
  min-width: 50px;
`;
