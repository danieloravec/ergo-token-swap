export type SupportedThemeName = 'light' | 'dark';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface Theme {
  name: SupportedThemeName;
  properties: {
    colorBg: string;
    colorNavs: string;
    colorPrimary: string;
    colorSecondary: string;
    colorBgText: string;
    colorNavsText: string;
    alertColors: {
      info: string;
      success: string;
      warning: string;
      error: string;
    };
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
    alertColors: {
      info: '#038cbd',
      success: '#00b894',
      warning: '#c08146',
      error: '#e74c3c',
    },
  },
};

export const DarkTheme: Theme = {
  name: 'dark',
  properties: {
    colorBg: '#222831',
    colorNavs: '#323841',
    colorPrimary: '#038cbd',
    colorSecondary: '#c08146',
    colorBgText: '#e4dede',
    colorNavsText: '#e4dede',
    alertColors: {
      info: '#038cbd',
      success: '#00b894',
      warning: '#c08146',
      error: '#e74c3c',
    },
  },
};

export const themes: { [key in SupportedThemeName]: Theme } = {
  light: LightTheme,
  dark: DarkTheme,
};
