import { Nav } from '@components/Nav/Nav';
import { ThemeProvider } from 'styled-components';
import { useThemeStore } from '@components/hooks';
import React from 'react';
import { Footer } from '@components/Footer/Footer';
import { HomeMainSection } from '@components/Home/HomeMainSection';

export default function Home(): JSX.Element {
  const { theme } = useThemeStore();
  return (
    <ThemeProvider theme={theme}>
      <Nav />
      <HomeMainSection />
      <Footer />
    </ThemeProvider>
  );
}
