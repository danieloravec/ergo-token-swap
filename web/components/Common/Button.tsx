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
  color: ${(props) => props.theme.properties.colorNavsText};
  cursor: pointer;
`;

export const ButtonFitting = styled(Button)`
  width: 100%;
`;

export const ButtonSecondary = styled(Button)`
  background: ${(props) => props.theme.properties.colorSecondary};
`;

export const ButtonTertiary = styled(Button)`
  background: none;
  color: ${(props) => props.theme.properties.colorBgText};
  border-radius: 50px;
  width: 100px;
  height: 25px;
`;

export const ButtonTertiarySquared = styled(Button)`
  background: none;
  color: ${(props) => props.theme.properties.colorBgText};
  border-radius: 10px;
`;

export const DisabledButton = styled(Button)`
  background-color: ${(props) => props.theme.properties.colorNavs};
`;
