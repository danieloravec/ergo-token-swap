import { Logo } from '@components/Common/Logo';
import { NavLinkSpaced } from '@components/Nav/NavLinkSpaced';
import { ConnectWalletButton } from '@components/Wallet/ConnectWalletButton';
import styled from 'styled-components';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { useWalletStore } from '@components/Wallet/hooks';
import NoSsr from '@components/Common/NoSsr';

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
`;

const ConnectWalletButtonContainer = styled.div`
  display: none;
  @media (min-width: 600px) {
    display: flex;
  }
`;

export function Nav(): JSX.Element {
  const { address } = useWalletStore();

  return (
    <NoSsr>
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
    </NoSsr>
  );
}
