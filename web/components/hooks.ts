import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { themes, type SupportedThemeName, type Theme } from '@themes/themes';
import { config } from '@config';

export const useThemeStore = create<{
  themeName: SupportedThemeName;
  theme: Theme;
  setThemeName: (tn: SupportedThemeName) => void;
  setTheme: (t: Theme) => void;
}>()(
  persist(
    (set, get) => ({
      themeName: config.defaultThemeName,
      theme: themes[config.defaultThemeName],
      setThemeName: (tn: SupportedThemeName) => {
        set({ themeName: tn });
      },
      setTheme: (t: Theme) => {
        set({ theme: t });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

export const useJwtAuth = create<{
  jwt?: string;
  setJwt: (token: string) => void;
}>()(
  persist(
    (set, get) => ({
      jwt: undefined,
      setJwt: (token?: string) => {
        set({ jwt: token });
      },
    }),
    {
      name: 'jwt-storage',
    }
  )
);
