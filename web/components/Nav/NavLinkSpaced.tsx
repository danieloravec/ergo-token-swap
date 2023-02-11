import styled from 'styled-components';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import React from 'react';

interface NavLinkProps {
  href?: string;
  children?: React.ReactNode;
}

const StyledNavLink = styled.a`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  width: auto;
  max-width: 100px;
  height: 21px;
`;

const LinkAndSpacerContainer = styled.div`
  display: flex;
  float: right;
`;

export function NavLinkSpaced(props: NavLinkProps): JSX.Element {
  return (
    <LinkAndSpacerContainer>
      <StyledNavLink href={props.href === undefined ? '#' : props.href}>
        {props.children === undefined ? null : props.children}
      </StyledNavLink>
      <Spacer vertical={false} size={spacing.spacing_xl} />
    </LinkAndSpacerContainer>
  );
}
