import { Nav } from '@components/Nav/Nav';
import { ThemeProvider } from 'styled-components';
import { useThemeStore } from '@components/hooks';
import React from 'react';

export default function Home(): JSX.Element {
  const { theme } = useThemeStore();
  return (
    <ThemeProvider theme={theme}>
      <Nav />
    </ThemeProvider>
  );
}
