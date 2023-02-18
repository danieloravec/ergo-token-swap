import styled from 'styled-components';

export const CenteredDivHorizontal = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  position: relative;
  width: 100%;
  align-items: center;
  align-content: center;
  justify-content: center;
`;

export const CenteredDivVertical = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  position: relative;
  height: 100%;
  align-items: center;
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
  min-height: calc(100vh - 146px);
  flex-direction: column;
  align-content: center;
  background: ${(props) => props.theme.properties.colorBg};
`;
