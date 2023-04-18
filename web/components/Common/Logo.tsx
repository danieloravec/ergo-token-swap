import Image from 'next/image';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { Text } from 'components/Common/Text';
import { CenteredDivHorizontal } from '@components/Common/Alignment';

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
      <CenteredDivHorizontal>
        <Text style={{ fontSize: '22px' }}>SingleTxSwap</Text>
      </CenteredDivHorizontal>
      <Image src="/logo.png" alt="logo" width="60" height="60" />
    </LogoContainer>
  );
}
