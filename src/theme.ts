import { useColorScheme } from '@/hooks/use-color-scheme';

export const Colors = {
  light: {
    text: '#101010',
    background: '#fff9ec',
    surface: '#ffffff',
    border: '#101010',
    textSecondary: '#555555',
    textMuted: '#8a8a8a',
    accent: '#58d66b',
    plus: '#ffd43b',
    tagBg: '#101010',
    tagText: '#fff9ec',
    shadow: '#101010',
  },
  dark: {
    text: '#f7f1e6',
    background: '#17130d',
    surface: '#221d15',
    border: '#f2ead9',
    textSecondary: '#a89f8d',
    textMuted: '#8a8a8a',
    accent: '#58d66b',
    plus: '#ffd43b',
    tagBg: '#f2ead9',
    tagText: '#17130d',
    shadow: '#000000',
  },
} as const;

export type ThemeColors = (typeof Colors)[keyof typeof Colors];

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;

export function useTheme(): ThemeColors {
  const scheme = useColorScheme();

  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}
