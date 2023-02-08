import { Logo } from '@components/Logo';
import { NavLinkSpaced } from '@components/Nav/NavLinkSpaced';
import { ConnectWalletButton } from '@components/Wallet/ConnectWalletButton';
import styled from 'styled-components';
import { useThemeStore } from '@components/hooks';
import { type Theme } from '@themes/themes';
import { Spacer } from '@components/Spacer';
import { spacing } from '@themes/spacing';

interface NavContainerProps {
  theme: Theme;
}

const NavContainer = styled.div<NavContainerProps>`
  display: block;
  position: relative;
  width: 100%;
  height: 82px;
  background: ${(props: NavContainerProps) => props.theme.properties.colorNavs};
  align-content: center;
`;

const NavSubcontainer = styled.div`
  display: flex;
  flex-direction: row;
  float: ${(props: { float: 'left' | 'right' }) => props.float};
  align-items: center;
`;

export function Nav(): JSX.Element {
  const { theme } = useThemeStore();
  return (
    <NavContainer theme={theme}>
      <Spacer size={spacing.spacing_xs} vertical />
      <NavSubcontainer float="left">
        <Spacer size={spacing.spacing_xs} vertical={false} />
        <Logo />
      </NavSubcontainer>
      <NavSubcontainer float="right">
        <NavLinkSpaced href="#">Home</NavLinkSpaced>
        <NavLinkSpaced href="#">About</NavLinkSpaced>
        <ConnectWalletButton />
        <Spacer size={spacing.spacing_xs} vertical={false} />
      </NavSubcontainer>
    </NavContainer>
  );
}
