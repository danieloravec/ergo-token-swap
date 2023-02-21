import styled from 'styled-components';
import { type ReactNode } from 'react';
import { CenteredDivHorizontal } from '@components/Common/Alignment';
import { Toggle } from '@components/Common/Toggle';
import { useThemeStore } from '@components/hooks';
import { type SupportedThemeName, DarkTheme, LightTheme } from '@themes/themes';
import NoSsr from '@components/Common/NoSsr';
import { GitHub } from '@components/Icons/GitHub';
import { Discord } from '@components/Icons/Discord';

const FooterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  width: 100%;
  height: 200px;
  background: ${(props) => props.theme.properties.colorNavs};
  color: ${(props) => props.theme.properties.colorNavsText};
  align-content: center;
  justify-content: center;
  margin-top: auto;
`;

const FooterTextContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  position: relative;
  width: 100%;
  align-content: center;
  justify-content: center;
  height: 45px;
`;

const FooterText = (props: { children: ReactNode }): JSX.Element => {
  return (
    <FooterTextContainer>
      <CenteredDivHorizontal>{props.children}</CenteredDivHorizontal>
    </FooterTextContainer>
  );
};

export const Footer = (): JSX.Element => {
  const { themeName, setTheme, setThemeName } = useThemeStore();
  return (
    <NoSsr>
      <FooterContainer>
        <FooterText>
          <Discord />
          danza#2629
        </FooterText>
        <FooterText>
          <GitHub />
          <a
            href="https://github.com/danieloravec/ergo-token-swap"
            target="_blank"
          >
            {' '}
            GitHub
          </a>
        </FooterText>
        <FooterText>
          <Toggle
            leftOption="Light"
            rightOption="Dark"
            selected={themeName === 'light' ? 'left' : 'right'}
            onToggle={(toggledToSide) => {
              if (toggledToSide === 'left') {
                setThemeName('light' as SupportedThemeName);
                setTheme(LightTheme);
              } else {
                setThemeName('dark' as SupportedThemeName);
                setTheme(DarkTheme);
              }
            }}
          />
        </FooterText>
        <FooterText>© single-tx-swap.com {new Date().getFullYear()}</FooterText>
      </FooterContainer>
    </NoSsr>
  );
};
