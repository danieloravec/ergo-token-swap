import styled from 'styled-components';

export const CenteredDivHorizontal = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  position: relative;
  width: 100%;
  align-content: center;
  justify-content: center;
`;

export const CenteredDivVertical = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  position: relative;
  height: 100%;
  align-content: center;
  justify-content: center;
`;

export const FlexDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
`;

export const MainSectionDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  height: 80vh;
  flex-direction: column;
  align-content: center;
  background: ${(props) => props.theme.properties.colorBg};
`;
