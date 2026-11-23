import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { useEffect, useState, type ReactNode } from 'react';

import { CategoriesProvider } from '@/hooks/use-categories';
import { TodosProvider } from '@/hooks/use-todos';
import { DesignProvider, useDesign } from '@/theme';
import { migrateDbIfNeeded } from '@/db';
import { RESOURCE_MANIFEST_URL, syncResourcePack } from '@/resource-pack';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName='todo.db' onInit={migrateDbIfNeeded}>
      <DesignProvider>
        <ResourceBootstrap>
          <TodosProvider>
            <CategoriesProvider>
              <ThemedApp />
            </CategoriesProvider>
          </TodosProvider>
        </ResourceBootstrap>
      </DesignProvider>
    </SQLiteProvider>
  );
}

function ResourceBootstrap({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(Boolean(RESOURCE_MANIFEST_URL));

  useEffect(() => {
    if (!RESOURCE_MANIFEST_URL) return;
    syncResourcePack(db)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [db]);

  if (loading) {
    return (
      <View style={styles.bootstrap}>
        <ActivityIndicator />
        <Text style={styles.bootstrapText}>Preparing resources…</Text>
      </View>
    );
  }

  return <>{children}</>;
}

/** Applies the resolved theme (after the user's appearance override) to the app. */
function ThemedApp() {
  const { scheme } = useDesign();
  const isDark = scheme === 'dark';

  return (
    <View style={styles.root}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} animated />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="pdf/[bookId]" />
        </Stack>
      </ThemeProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bootstrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  bootstrapText: {
    color: '#6f6b64',
    fontSize: 14,
  },
});
