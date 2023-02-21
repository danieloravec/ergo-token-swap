import Image from 'next/image';
import styled from 'styled-components';
import { useRouter } from 'next/router';

const LogoContainer = styled.div`
  display: flex;
  width: auto;
`;

export function Logo(): JSX.Element {
  const router = useRouter();
  return (
    <LogoContainer
      onClick={() => {
        const redirectHome = async (): Promise<void> => {
          await router.push('/');
        };
        redirectHome().catch(console.error);
      }}
    >
      <Image src="/logo.png" alt="logo" width="100" height="50" />
    </LogoContainer>
  );
}
