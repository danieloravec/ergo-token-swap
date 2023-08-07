import { Logo } from '@components/Common/Logo';
import { NavLinkSpaced } from '@components/Nav/NavLinkSpaced';
import { ConnectWalletButton } from '@components/Wallet/ConnectWalletButton';
import styled, { useTheme } from 'styled-components';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { useWalletStore } from '@components/Wallet/hooks';
import NoSsr from '@components/Common/NoSsr';
import { useWindowDimensions } from '@components/hooks';
import { useState } from 'react';
import {
  CenteredDivHorizontal,
  FlexDiv,
  FlexDivRow,
} from '@components/Common/Alignment';
import { Hamburger } from '@components/Icons/Hamburger';
import { Heading3 } from '@components/Common/Text';

const NavContainer = styled.div`
  display: block;
  position: relative;
  width: 100%;
  height: 82px;
  background: ${(props) => props.theme.properties.colorNavs};
  align-content: center;
`;

const NavSubcontainer = styled.div`
  display: flex;
  flex-direction: row;
  float: ${(props: { float: 'left' | 'right' }) => props.float};
  align-items: center;
  margin-left: ${(props) => (props.float === 'left' ? '0' : 'auto')};
  margin-top: auto;
  margin-bottom: auto;
`;

const ConnectWalletButtonContainer = styled.div`
  display: none;
  @media (min-width: 600px) {
    display: flex;
  }
`;

export function Nav(props: { mobileIfLessThan: number }): JSX.Element {
  const { address } = useWalletStore();
  const [isOpen, setIsOpen] = useState(false);
  const { width } = useWindowDimensions();

  const DesktopMenu = (): JSX.Element => {
    return (
      <NavContainer>
        <Spacer size={spacing.spacing_xs} vertical />
        <NavSubcontainer float="left">
          <Spacer size={spacing.spacing_xs} vertical={false} />
          <Logo />
        </NavSubcontainer>
        <NavSubcontainer float="right">
          <NavLinkSpaced href="/">Home</NavLinkSpaced>
          {address !== undefined && (
            <NavLinkSpaced href={`/profile/${address}`}>Profile</NavLinkSpaced>
          )}
          {address !== undefined && (
            <NavLinkSpaced href="/messages/view">Messages</NavLinkSpaced>
          )}
          <NavLinkSpaced href="/holders">HolderSearch</NavLinkSpaced>
          <ConnectWalletButtonContainer>
            <ConnectWalletButton />
          </ConnectWalletButtonContainer>
          <Spacer size={spacing.spacing_xs} vertical={false} />
        </NavSubcontainer>
      </NavContainer>
    );
  };

  const MobileMenu = (): JSX.Element => {
    const MainRow = (): JSX.Element => {
      const theme = useTheme();

      return (
        <FlexDivRow>
          <NavContainer
            style={{ borderBottom: `1px solid ${theme.properties.colorBg}` }}
          >
            <Spacer size={spacing.spacing_xs} vertical />
            <NavSubcontainer float="left">
              <Spacer size={spacing.spacing_xs} vertical={false} />
              <Logo />
            </NavSubcontainer>
            <NavSubcontainer float="right">
              <FlexDiv
                onClick={() => {
                  setIsOpen(!isOpen);
                }}
              >
                <br />
                <Hamburger width={36} height={36} />
                <Spacer size={spacing.spacing_xs} vertical={false} />
              </FlexDiv>
            </NavSubcontainer>
          </NavContainer>
          {isOpen && (
            <FlexDivRow>
              <NavContainer
                style={{
                  borderBottom: `1px solid ${theme.properties.colorBg}`,
                }}
              >
                <NavSubcontainer
                  float="left"
                  style={{ marginTop: `${spacing.spacing_m}px` }}
                >
                  <Spacer size={spacing.spacing_xs} vertical={false} />
                  <NavLinkSpaced href="/">
                    <CenteredDivHorizontal>
                      <Heading3
                        style={{ color: theme.properties.colorNavsText }}
                      >
                        Home
                      </Heading3>
                    </CenteredDivHorizontal>
                  </NavLinkSpaced>
                </NavSubcontainer>
              </NavContainer>
              <NavContainer>
                <NavSubcontainer
                  float="left"
                  style={{ marginTop: `${spacing.spacing_m}px` }}
                >
                  <Spacer size={spacing.spacing_xs} vertical={false} />
                  <NavLinkSpaced href="/holders">
                    <CenteredDivHorizontal>
                      <Heading3
                        style={{ color: theme.properties.colorNavsText }}
                      >
                        HolderSearch
                      </Heading3>
                    </CenteredDivHorizontal>
                  </NavLinkSpaced>
                </NavSubcontainer>
              </NavContainer>
            </FlexDivRow>
          )}
        </FlexDivRow>
      );
    };

    return (
      <FlexDiv>
        <MainRow />
      </FlexDiv>
    );
  };

  return (
    <NoSsr>
      {width >= props.mobileIfLessThan && <DesktopMenu />}
      {width < props.mobileIfLessThan && <MobileMenu />}
    </NoSsr>
  );
}
