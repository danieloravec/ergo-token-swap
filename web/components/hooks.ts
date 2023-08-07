import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { themes, type SupportedThemeName, type Theme } from '@themes/themes';
import { config } from '@config';
import { useEffect, useState } from 'react';

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

export const useWindowDimensions = (): { width: number; height: number } => {
  const hasWindow = typeof window !== 'undefined';

  const getWindowDimensions = (): { width: number; height: number } => {
    const width = hasWindow ? window.innerWidth : 1000;
    const height = hasWindow ? window.innerHeight : 800;
    return { width, height };
  };

  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    if (hasWindow) {
      const handleResize = (): void => {
        setWindowDimensions(getWindowDimensions());
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [hasWindow]);

  return windowDimensions;
};
