import styled from 'styled-components';

export const Button = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0;
  position: relative;
  width: 200px;
  height: 50px;
  border-radius: 10px;
  background: ${(props) => props.theme.properties.colorPrimary};
`;
