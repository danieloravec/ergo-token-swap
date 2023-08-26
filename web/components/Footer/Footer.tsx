import styled from 'styled-components';
import React, { type ReactNode } from 'react';
import {
  CenteredDivHorizontal,
  FlexDiv,
  FlexDivRow,
} from '@components/Common/Alignment';
import { Toggle } from '@components/Common/Toggle';
import { useThemeStore } from '@components/hooks';
import { type SupportedThemeName, DarkTheme, LightTheme } from '@themes/themes';
import NoSsr from '@components/Common/NoSsr';
import { GitHub } from '@components/Icons/GitHub';
import { Discord } from '@components/Icons/Discord';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { Heading2 } from '@components/Common/Text';
import { SkyHarbor } from '@components/Icons/SkyHarbor';
import { ErgoLogo } from '@components/Icons/ErgoLogo';

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

const FooterHeading = styled(Heading2)`
  color: ${(props) => props.theme.properties.colorNavsText};
`;

export const Footer = (): JSX.Element => {
  const { themeName, setTheme, setThemeName } = useThemeStore();

  return (
    <NoSsr>
      <FooterContainer>
        <FlexDivRow>
          <FlexDiv style={{ width: '30%' }}>
            <FooterText>
              <FooterHeading>Contact</FooterHeading>
            </FooterText>
            <FooterText>
              <Discord />
              <Spacer size={spacing.spacing_xxxs} vertical={false} />
              danza#2629
            </FooterText>
            <FooterText>
              <GitHub />
              <Spacer size={spacing.spacing_xxxs} vertical={false} />
              <a
                href="https://github.com/danieloravec/ergo-token-swap"
                target="_blank"
              >
                GitHub
              </a>
            </FooterText>
          </FlexDiv>

          <FlexDiv style={{ width: '30%' }}>
            <FooterText>
              <FooterHeading>Partners</FooterHeading>
            </FooterText>
            <FooterText>
              <SkyHarbor />
              <Spacer size={spacing.spacing_xxxs} vertical={false} />
              NFTs verified by{' '}
              <a
                style={{ marginLeft: `${spacing.spacing_xxxs}px` }}
                target="_blank"
                href="https://www.skyharbor.io"
              >
                SkyHarbor.io
              </a>
            </FooterText>
            <FooterText>
              <ErgoLogo />
              <Spacer size={spacing.spacing_xxxs} vertical={false} />
              Powered by Ergo
            </FooterText>
          </FlexDiv>

          <FlexDiv style={{ width: '30%' }}>
            <FooterText>
              <FooterHeading>Other</FooterHeading>
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
            <FooterText>
              © single-tx-swap.com {new Date().getFullYear()}
            </FooterText>
          </FlexDiv>
        </FlexDivRow>
      </FooterContainer>
    </NoSsr>
  );
};
