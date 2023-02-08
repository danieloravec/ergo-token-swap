import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { themes, type SupportedThemeName, type Theme } from '@themes/themes';

const defaultThemeName: SupportedThemeName = 'light'; // TODO move to config

export const useThemeStore = create<{
  themeName: SupportedThemeName;
  theme: Theme;
  setThemeName: (tn: SupportedThemeName) => void;
  setTheme: (t: Theme) => void;
}>()(
  persist(
    (set, get) => ({
      themeName: defaultThemeName,
      theme: themes[defaultThemeName as SupportedThemeName],
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
