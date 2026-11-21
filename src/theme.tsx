import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

export type DesignId = 'minimal' | 'soft' | 'bold' | 'compact';

/** User-selected appearance: follow the OS, or force light/dark. */
export type ThemeMode = 'system' | 'light' | 'dark';

export type DesignPalette = {
  text: string;
  background: string;
  surface: string;
  border: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  onAccent: string;
  plus: string;
  onPlus: string;
  tagBg: string;
  tagText: string;
  /** Fill color for hard/soft drop shadows (a solid color for hard, rgba for soft). */
  shadow: string;
};

export type TypeToken = {
  size: number;
  lineHeight: number;
  weight: '400' | '500' | '600' | '700' | '800' | '900';
  case?: 'uppercase' | 'none';
  letterSpacing?: number;
};

export type ShadowToken = {
  dx: number;
  dy: number;
  blur: number;
  /** hard = sticker-style offset with zero blur; soft = blurred glow. */
  hard: boolean;
};

export type DesignTokens = {
  title: TypeToken;
  subtitle: TypeToken;
  add: {
    style: 'box' | 'hairline' | 'pill' | 'slim';
    radius: number;
    borderWidth: number;
    shadow: ShadowToken | null;
    inputWeight: TypeToken['weight'];
    buttonSize: number;
    buttonRadius: number;
    buttonBorderWidth: number;
  };
  item: {
    style: 'card' | 'row';
    radius: number;
    borderWidth: number;
    paddingV: number;
    paddingH: number;
    gap: number;
    listGap: number;
    shadow: ShadowToken | null;
    text: TypeToken;
  };
  checkbox: {
    shape: 'square' | 'rounded' | 'circle';
    size: number;
    borderWidth: number;
    checkSize: number;
  };
  footer: {
    style: 'tag' | 'plain';
    radius: number;
    uppercase: boolean;
    size: number;
    weight: TypeToken['weight'];
  };
  section: {
    style: 'tag' | 'pill' | 'underline' | 'label';
    radius: number;
    uppercase: boolean;
    size: number;
    weight: TypeToken['weight'];
    letterSpacing?: number;
  };
  header: {
    /** Show a completion progress bar under the home title. */
    progress: boolean;
    /** Group the list into TODAY / DONE sections. */
    sections: boolean;
  };
  nav: {
    radius: number;
    borderWidth: number;
    shadow: ShadowToken | null;
    itemRadius: number;
    iconSize: number;
    label: TypeToken;
  };
};

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

export const DESIGN_OPTIONS: {
  id: DesignId;
  label: string;
  description: string;
  swatch: [string, string, string];
}[] = [
  {
    id: 'minimal',
    label: 'Minimal editorial',
    description: 'Hairline rules, quiet type, generous air.',
    swatch: ['#fbfaf7', '#b4442a', '#1c1c1e'],
  },
  {
    id: 'soft',
    label: 'Soft cards',
    description: 'Rounded corners, pastel tint, gentle shadows.',
    swatch: ['#f7f5fc', '#9b8cf5', '#c9bdfb'],
  },
  {
    id: 'bold',
    label: 'Bold playful',
    description: 'Thick borders, hard shadows, sticker energy.',
    swatch: ['#fff9ec', '#58d66b', '#ffd43b'],
  },
  {
    id: 'compact',
    label: 'Compact productivity',
    description: 'Dense rows, sections, progress at a glance.',
    swatch: ['#f6f7f9', '#2563eb', '#111827'],
  },
];

export const THEME_MODE_OPTIONS: { id: ThemeMode; label: string }[] = [
  { id: 'system', label: 'Auto' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

const PALETTES: Record<DesignId, { light: DesignPalette; dark: DesignPalette }> = {
  minimal: {
    light: {
      text: '#1c1c1e',
      background: '#fbfaf7',
      surface: '#ffffff',
      border: '#e7e4de',
      textSecondary: '#6f6b64',
      textMuted: '#a29d95',
      accent: '#b4442a',
      onAccent: '#ffffff',
      plus: '#1c1c1e',
      onPlus: '#fbfaf7',
      tagBg: '#f1efe9',
      tagText: '#1c1c1e',
      shadow: 'transparent',
    },
    dark: {
      text: '#ecebe8',
      background: '#121212',
      surface: '#1a1a1a',
      border: '#302f2d',
      textSecondary: '#9a9793',
      textMuted: '#6f6c68',
      accent: '#e0785c',
      onAccent: '#121212',
      plus: '#ecebe8',
      onPlus: '#121212',
      tagBg: '#232220',
      tagText: '#ecebe8',
      shadow: 'transparent',
    },
  },
  soft: {
    light: {
      text: '#3b3554',
      background: '#f7f5fc',
      surface: '#ffffff',
      border: '#ddd7f2',
      textSecondary: '#7b7595',
      textMuted: '#a8a3c0',
      accent: '#9b8cf5',
      onAccent: '#ffffff',
      plus: '#c9bdfb',
      onPlus: '#322a52',
      tagBg: '#efeafd',
      tagText: '#5c51a8',
      shadow: 'rgba(74, 58, 138, 0.16)',
    },
    dark: {
      text: '#ece9f7',
      background: '#191727',
      surface: '#221f36',
      border: '#3d3863',
      textSecondary: '#a6a1c2',
      textMuted: '#7b7698',
      accent: '#a99bfb',
      onAccent: '#191727',
      plus: '#8b7cf5',
      onPlus: '#171428',
      tagBg: '#2b2745',
      tagText: '#c6bff2',
      shadow: 'rgba(0, 0, 0, 0.4)',
    },
  },
  bold: {
    light: {
      text: '#101010',
      background: '#fff9ec',
      surface: '#ffffff',
      border: '#101010',
      textSecondary: '#555555',
      textMuted: '#8a8a8a',
      accent: '#58d66b',
      onAccent: '#101010',
      plus: '#ffd43b',
      onPlus: '#101010',
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
      onAccent: '#101010',
      plus: '#ffd43b',
      onPlus: '#101010',
      tagBg: '#f2ead9',
      tagText: '#17130d',
      shadow: '#000000',
    },
  },
  compact: {
    light: {
      text: '#111827',
      background: '#f6f7f9',
      surface: '#ffffff',
      border: '#e5e7eb',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      accent: '#2563eb',
      onAccent: '#ffffff',
      plus: '#2563eb',
      onPlus: '#ffffff',
      tagBg: '#eff6ff',
      tagText: '#1d4ed8',
      shadow: 'transparent',
    },
    dark: {
      text: '#e8eaed',
      background: '#0f1114',
      surface: '#171a1f',
      border: '#2a2e35',
      textSecondary: '#9aa3af',
      textMuted: '#6b7280',
      accent: '#3b82f6',
      onAccent: '#ffffff',
      plus: '#3b82f6',
      onPlus: '#ffffff',
      tagBg: '#1b2436',
      tagText: '#93c5fd',
      shadow: 'transparent',
    },
  },
};

const TOKENS: Record<DesignId, DesignTokens> = {
  minimal: {
    title: { size: 33, lineHeight: 40, weight: '500', letterSpacing: -0.6 },
    subtitle: { size: 13, lineHeight: 18, weight: '400' },
    add: {
      style: 'hairline',
      radius: 0,
      borderWidth: 0,
      shadow: null,
      inputWeight: '400',
      buttonSize: 0,
      buttonRadius: 0,
      buttonBorderWidth: 0,
    },
    item: {
      style: 'row',
      radius: 0,
      borderWidth: 0,
      paddingV: 14,
      paddingH: 4,
      gap: Spacing.three,
      listGap: 0,
      shadow: null,
      text: { size: 15, lineHeight: 22, weight: '500' },
    },
    checkbox: { shape: 'circle', size: 21, borderWidth: 1.5, checkSize: 12 },
    footer: { style: 'plain', radius: 0, uppercase: true, size: 11, weight: '500' },
    section: { style: 'underline', radius: 0, uppercase: true, size: 11, weight: '600' },
    header: { progress: false, sections: false },
    nav: {
      radius: 12,
      borderWidth: 1,
      shadow: null,
      itemRadius: 8,
      iconSize: 15,
      label: { size: 10, lineHeight: 13, weight: '500', case: 'uppercase', letterSpacing: 0.6 },
    },
  },
  soft: {
    title: { size: 34, lineHeight: 42, weight: '700' },
    subtitle: { size: 14, lineHeight: 20, weight: '500' },
    add: {
      style: 'pill',
      radius: 999,
      borderWidth: 0,
      shadow: { dx: 0, dy: 4, blur: 12, hard: false },
      inputWeight: '500',
      buttonSize: 34,
      buttonRadius: 17,
      buttonBorderWidth: 0,
    },
    item: {
      style: 'card',
      radius: 18,
      borderWidth: 0,
      paddingV: 14,
      paddingH: 16,
      gap: Spacing.three,
      listGap: 10,
      shadow: { dx: 0, dy: 3, blur: 10, hard: false },
      text: { size: 15, lineHeight: 22, weight: '600' },
    },
    checkbox: { shape: 'rounded', size: 24, borderWidth: 2, checkSize: 13 },
    footer: { style: 'tag', radius: 999, uppercase: false, size: 12, weight: '600' },
    section: { style: 'pill', radius: 999, uppercase: false, size: 12, weight: '600' },
    header: { progress: false, sections: false },
    nav: {
      radius: 26,
      borderWidth: 0,
      shadow: { dx: 0, dy: 4, blur: 14, hard: false },
      itemRadius: 18,
      iconSize: 17,
      label: { size: 11, lineHeight: 14, weight: '600' },
    },
  },
  bold: {
    title: { size: 40, lineHeight: 46, weight: '900' },
    subtitle: { size: 14, lineHeight: 20, weight: '600' },
    add: {
      style: 'box',
      radius: 14,
      borderWidth: 3,
      shadow: { dx: 4, dy: 4, blur: 0, hard: true },
      inputWeight: '700',
      buttonSize: 34,
      buttonRadius: 9,
      buttonBorderWidth: 3,
    },
    item: {
      style: 'card',
      radius: 14,
      borderWidth: 3,
      paddingV: 10,
      paddingH: 16,
      gap: Spacing.three,
      listGap: 12,
      shadow: { dx: 3, dy: 3, blur: 0, hard: true },
      text: { size: 15.5, lineHeight: 22, weight: '800' },
    },
    checkbox: { shape: 'rounded', size: 24, borderWidth: 3, checkSize: 14 },
    footer: { style: 'tag', radius: 7, uppercase: true, size: 12, weight: '800' },
    section: { style: 'tag', radius: 7, uppercase: true, size: 12, weight: '800' },
    header: { progress: false, sections: false },
    nav: {
      radius: 22,
      borderWidth: 3,
      shadow: { dx: 4, dy: 4, blur: 0, hard: true },
      itemRadius: 14,
      iconSize: 18,
      label: { size: 11, lineHeight: 14, weight: '800', case: 'uppercase' },
    },
  },
  compact: {
    title: { size: 22, lineHeight: 28, weight: '700' },
    subtitle: { size: 12, lineHeight: 16, weight: '500' },
    add: {
      style: 'slim',
      radius: 8,
      borderWidth: 1,
      shadow: null,
      inputWeight: '500',
      buttonSize: 28,
      buttonRadius: 6,
      buttonBorderWidth: 0,
    },
    item: {
      style: 'row',
      radius: 0,
      borderWidth: 0,
      paddingV: 9,
      paddingH: 4,
      gap: Spacing.two,
      listGap: 0,
      shadow: null,
      text: { size: 14, lineHeight: 20, weight: '500' },
    },
    checkbox: { shape: 'square', size: 18, borderWidth: 1.5, checkSize: 11 },
    footer: { style: 'plain', radius: 0, uppercase: false, size: 12, weight: '500' },
    section: { style: 'label', radius: 0, uppercase: true, size: 11, weight: '700', letterSpacing: 0.6 },
    header: { progress: true, sections: true },
    nav: {
      radius: 10,
      borderWidth: 1,
      shadow: null,
      itemRadius: 7,
      iconSize: 14,
      label: { size: 10, lineHeight: 13, weight: '600' },
    },
  },
};

const DESIGN_STORAGE_KEY = 'todo.design';
const MODE_STORAGE_KEY = 'todo.mode';

type DesignContextValue = {
  design: DesignId;
  setDesign: (design: DesignId) => void;
  /** The user's appearance preference (persisted). */
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** Resolved color scheme after applying the mode override ('light' | 'dark'). */
  scheme: 'light' | 'dark';
  colors: DesignPalette;
  tokens: DesignTokens;
};

const DesignContext = createContext<DesignContextValue | null>(null);

export function DesignProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [design, setDesignState] = useState<DesignId>('bold');
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Hydrate the persisted choice after mount (keeps SSR/hydration deterministic).
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(DESIGN_STORAGE_KEY)
      .then((stored) => {
        if (mounted && stored && stored in PALETTES) {
          setDesignState(stored as DesignId);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Same hydration pattern for the appearance mode (defaults to 'system').
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(MODE_STORAGE_KEY)
      .then((stored) => {
        if (
          mounted &&
          (stored === 'system' || stored === 'light' || stored === 'dark')
        ) {
          setModeState(stored);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const setDesign = useCallback((next: DesignId) => {
    setDesignState(next);
    AsyncStorage.setItem(DESIGN_STORAGE_KEY, next).catch(() => {});
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(MODE_STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo<DesignContextValue>(() => {
    const scheme: 'light' | 'dark' =
      mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
    return {
      design,
      setDesign,
      mode,
      setMode,
      scheme,
      colors: PALETTES[design][scheme],
      tokens: TOKENS[design],
    };
  }, [design, mode, systemScheme, setDesign, setMode]);

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesign(): DesignContextValue {
  const ctx = useContext(DesignContext);
  if (!ctx) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return ctx;
}

/** Current palette. Kept as `useTheme()` so existing call sites stay simple. */
export function useTheme(): DesignPalette {
  return useDesign().colors;
}

/** Builds a React Native `boxShadow` string from a shadow token, or undefined. */
export function boxShadow(
  shadow: ShadowToken | null | undefined,
  color: string,
): string | undefined {
  if (!shadow) return undefined;
  return shadow.hard
    ? `${shadow.dx}px ${shadow.dy}px 0px ${color}`
    : `${shadow.dx}px ${shadow.dy}px ${shadow.blur}px ${color}`;
}

/** Spreads a TypeToken into a Text style object. */
export function typeStyle(token: TypeToken) {
  return {
    fontSize: token.size,
    lineHeight: token.lineHeight,
    fontWeight: token.weight,
    textTransform: (token.case === 'uppercase' ? 'uppercase' : 'none') as
      | 'uppercase'
      | 'none',
    letterSpacing: token.letterSpacing,
  };
}
