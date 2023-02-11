import Image from 'next/image';
import styled from 'styled-components';

const LogoContainer = styled.div`
  display: flex;
  width: auto;
`;

export function Logo(): JSX.Element {
  return (
    <LogoContainer>
      <Image src="/logo.png" alt="logo" width="50" height="50" />
    </LogoContainer>
  );
}
