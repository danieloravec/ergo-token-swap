export type SupportedThemeName = 'light' | 'dark';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface Theme {
  name: SupportedThemeName;
  properties: {
    colorBg: string;
    colorBgGreyed: string;
    colorNavs: string;
    colorPrimary: string;
    colorSecondary: string;
    colorBgText: string;
    colorNavsText: string;
    colorExtras: string;
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
    colorBgGreyed: '#b4aeae',
    colorNavs: '#222831', // dark gray
    colorPrimary: '#038cbd', // light blue
    colorSecondary: '#c08146', // orange
    colorBgText: '#222831',
    colorNavsText: '#e4dede',
    colorExtras: '#323841',
    alertColors: {
      info: '#038cbd',
      success: '#124d1f',
      warning: '#694602',
      error: '#570211',
    },
  },
};

export const DarkTheme: Theme = {
  name: 'dark',
  properties: {
    colorBg: '#222831',
    colorBgGreyed: '#121821',
    colorNavs: '#323841',
    colorPrimary: '#038cbd',
    colorSecondary: '#c08146',
    colorBgText: '#e4dede',
    colorNavsText: '#e4dede',
    colorExtras: '#121821',
    alertColors: {
      info: '#038cbd',
      success: '#124d1f',
      warning: '#694602',
      error: '#570211',
    },
  },
};

export const themes: { [key in SupportedThemeName]: Theme } = {
  light: LightTheme,
  dark: DarkTheme,
};
