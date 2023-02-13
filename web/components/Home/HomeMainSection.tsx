import { Introduction } from '@components/Home/Introduction';
import { MainSectionDiv } from '@components/Common/Alignment';
import { ThemeProvider, useTheme } from 'styled-components';
import { FAQ } from '@components/Home/FAQ';

export function HomeMainSection(): JSX.Element {
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <MainSectionDiv>
        <Introduction />
        <FAQ />
      </MainSectionDiv>
    </ThemeProvider>
  );
}
