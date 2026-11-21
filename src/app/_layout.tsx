import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { CategoriesProvider } from '@/hooks/use-categories';
import { TodosProvider } from '@/hooks/use-todos';
import { DesignProvider, useDesign } from '@/theme';

export default function RootLayout() {
  return (
    <DesignProvider>
      <TodosProvider>
        <CategoriesProvider>
          <ThemedApp />
        </CategoriesProvider>
      </TodosProvider>
    </DesignProvider>
  );
}

/** Applies the resolved theme (after the user's appearance override) to the app. */
function ThemedApp() {
  const { scheme } = useDesign();
  const isDark = scheme === 'dark';

  return (
    <View style={styles.root}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} animated />
        <AppTabs />
      </ThemeProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
