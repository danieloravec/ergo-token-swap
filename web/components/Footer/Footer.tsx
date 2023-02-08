import styled from 'styled-components';
import { type ReactNode } from 'react';

const FooterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  position: fixed;
  width: 100%;
  height: 146px;
  background: ${(props) => props.theme.properties.colorNavs};
  align-content: center;
  justify-content: center;
  bottom: 0;
`;

const FooterTextContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  position: relative;
  width: 100%;
  align-content: center;
  justify-content: center;
`;

function FooterText(props: { children: ReactNode }): JSX.Element {
  return (
    <FooterTextContainer>
      <p>{props.children}</p>
    </FooterTextContainer>
  );
}

export function Footer(): JSX.Element {
  return (
    <FooterContainer>
      <FooterText>support@ergotokenswap.io</FooterText>
      <FooterText>© ErgoTokenSwap {new Date().getFullYear()}</FooterText>
    </FooterContainer>
  );
}
