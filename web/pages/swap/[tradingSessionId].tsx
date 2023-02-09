import { Nav } from '@components/Nav/Nav';
import { ThemeProvider } from 'styled-components';
import { useThemeStore } from '@components/hooks';
import React from 'react';
import { Footer } from '@components/Footer/Footer';
import { WaitingPhaseCreator } from '@components/Swap/WaitingPhaseCreator';
import { useRouter } from 'next/router';

export default function Home(): JSX.Element {
  const { theme } = useThemeStore();
  const router = useRouter();
  const { tradingSessionId } = router.query;
  if (typeof tradingSessionId !== 'string') {
    return <div>Invalid trading session id</div>; // TODO use something more reasonable here
  }

  return (
    <ThemeProvider theme={theme}>
      <Nav />
      <WaitingPhaseCreator tradingSessionId={tradingSessionId} />
      <Footer />
    </ThemeProvider>
  );
}
