import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Spacing, useTheme } from '@/theme';

type TabButtonProps = Omit<TabTriggerSlotProps, 'ref'> & {
  icon: string;
  label: string;
};

function TabButton({ icon, label, isFocused, ...props }: TabButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.tab,
        isFocused && {
          backgroundColor: theme.plus,
          borderColor: theme.border,
          boxShadow: `3px 3px 0px ${theme.shadow}`,
        },
        pressed && styles.pressed,
      ]}>
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text
        style={[styles.tabLabel, { color: isFocused ? '#101010' : theme.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function AppTabs() {
  const theme = useTheme();

  return (
    <Tabs style={styles.tabs}>
      <TabSlot />
      <TabList
        style={[styles.tabList, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TabTrigger name="index" href="/" asChild>
          <TabButton icon="🏠" label="Home" />
        </TabTrigger>
        <TabTrigger name="settings" href="/settings" asChild>
          <TabButton icon="⚙️" label="Settings" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flex: 1,
  },
  tabList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.two,
    paddingBottom: 14,
    paddingHorizontal: Spacing.three,
    borderTopWidth: 3,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.65,
  },
  tabIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
  tabLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
