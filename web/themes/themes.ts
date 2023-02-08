export type SupportedThemeName = 'light' | 'dark';

export interface Theme {
  name: SupportedThemeName;
  properties: {
    colorBg: string;
    colorNavs: string;
    colorPrimary: string;
    colorSecondary: string;
  };
}

export const LightTheme: Theme = {
  name: 'light',
  properties: {
    colorBg: '#e4dede', // beige
    colorNavs: '#222831', // dark gray
    colorPrimary: '#038cbd', // light blue
    colorSecondary: '#c08146', // orange
  },
};

export const DarkTheme: Theme = {
  name: 'dark',
  properties: {
    colorBg: '#222831', // dark gray
    colorNavs: '#000000', // beige
    colorPrimary: '#038cbd', // light blue
    colorSecondary: '#c08146', // orange
  },
};

export const themes: { [key in SupportedThemeName]: Theme } = {
  light: LightTheme,
  dark: DarkTheme,
};
