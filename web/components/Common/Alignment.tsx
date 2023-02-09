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
