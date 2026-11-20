import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing, useTheme } from '@/theme';

type RowProps = {
  label: string;
  value?: string;
  children?: ReactNode;
};

function Row({ label, value, children }: RowProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          boxShadow: `3px 3px 0px ${theme.shadow}`,
        },
      ]}>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      {value != null && <Text style={[styles.rowValue, { color: theme.textSecondary }]}>{value}</Text>}
      {children}
    </View>
  );
}

function SectionTag({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <View style={[styles.tag, { backgroundColor: theme.tagBg }]}>
      <Text style={[styles.tagText, { color: theme.tagText }]}>{children}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const [notifications, setNotifications] = useState(true);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Make it yours.</Text>
        </View>

        <View style={styles.sections}>
          <SectionTag>Preferences</SectionTag>

          <Row label="Notifications">
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: notifications }}
              accessibilityLabel="Notifications"
              onPress={() => setNotifications((value) => !value)}
              style={({ pressed }) => [
                styles.switch,
                {
                  borderColor: theme.border,
                  backgroundColor: notifications ? theme.accent : theme.surface,
                  justifyContent: notifications ? 'flex-end' : 'flex-start',
                },
                pressed && styles.pressed,
              ]}>
              <View
                style={[
                  styles.knob,
                  { backgroundColor: notifications ? '#101010' : theme.textSecondary },
                ]}
              />
            </Pressable>
          </Row>

          <Row label="Appearance" value="Automatic" />

          <SectionTag>About</SectionTag>

          <Row label="Version" value="1.0.0" />
          <Row label="Made with" value="Expo" />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  header: {
    gap: Spacing.one,
    paddingBottom: Spacing.four,
  },
  title: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  sections: {
    gap: 12,
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: 7,
    paddingVertical: 6,
    paddingHorizontal: 11,
    marginTop: Spacing.one,
  },
  tagText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderWidth: 3,
    borderRadius: 14,
    paddingVertical: Spacing.two + Spacing.half,
    paddingHorizontal: Spacing.three,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
  rowValue: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  switch: {
    width: 52,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    paddingHorizontal: 3,
    alignItems: 'center',
  },
  knob: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  pressed: {
    opacity: 0.65,
  },
});
