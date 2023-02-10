export type SupportedThemeName = 'light' | 'dark';

export interface Theme {
  name: SupportedThemeName;
  properties: {
    colorBg: string;
    colorNavs: string;
    colorPrimary: string;
    colorSecondary: string;
    colorBgText: string;
    colorNavsText: string;
  };
}

export const LightTheme: Theme = {
  name: 'light',
  properties: {
    colorBg: '#e4dede', // beige
    colorNavs: '#222831', // dark gray
    colorPrimary: '#038cbd', // light blue
    colorSecondary: '#c08146', // orange
    colorBgText: '#222831',
    colorNavsText: '#e4dede',
  },
};

export const DarkTheme: Theme = {
  name: 'dark',
  properties: {
    colorBg: '#222831', // dark gray
    colorNavs: '#000000', // beige
    colorPrimary: '#038cbd', // light blue
    colorSecondary: '#c08146', // orange
    colorBgText: '#e4dede',
    colorNavsText: '#222831',
  },
};

export const themes: { [key in SupportedThemeName]: Theme } = {
  light: LightTheme,
  dark: DarkTheme,
};
