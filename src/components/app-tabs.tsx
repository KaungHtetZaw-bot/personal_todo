import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  type TabTriggerSlotProps,
} from "expo-router/ui";
import { Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { boxShadow, Spacing, typeStyle, useDesign, useTheme } from "@/theme";

type TabButtonProps = Omit<TabTriggerSlotProps, "ref"> & {
  icon: string;
  label: string;
};

function TabButton({ icon, label, isFocused, ...props }: TabButtonProps) {
  const theme = useTheme();
  const { tokens } = useDesign();
  const nav = tokens.nav;

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.tab,
        {
          borderRadius: nav.itemRadius,
          borderWidth: nav.borderWidth,
          borderColor: "transparent",
        },
        isFocused && {
          backgroundColor: theme.plus,
          borderColor: nav.borderWidth > 0 ? theme.border : "transparent",
          boxShadow: boxShadow(nav.shadow, theme.shadow),
        },
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.tabIcon,
          { fontSize: nav.iconSize, lineHeight: nav.iconSize + 4 },
        ]}
      >
        {icon}
      </Text>
      <Text
        style={[
          typeStyle(nav.label),
          { color: isFocused ? theme.onPlus : theme.textSecondary },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function AppTabs() {
  const theme = useTheme();
  const { tokens } = useDesign();
  const insets = useSafeAreaInsets();
  const nav = tokens.nav;

  return (
    <Tabs style={[styles.tabs, { backgroundColor: theme.background }]}>
      <TabSlot />
      <TabList
        style={[
          styles.tabList,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderRadius: nav.radius,
            borderWidth: nav.borderWidth,
            boxShadow: boxShadow(nav.shadow, theme.shadow),
            marginBottom: Math.max(insets.bottom, Spacing.three),
          },
        ]}
      >
        <TabTrigger name='index' href='/' asChild>
          <TabButton icon='🏠' label='Home' />
        </TabTrigger>
        <TabTrigger name='learn' href='/learn' asChild>
          <TabButton icon='📚' label='Learn' />
        </TabTrigger>
        <TabTrigger name='workout' href='/workout' asChild>
          <TabButton icon='🏋️' label='Workout' />
        </TabTrigger>
        <TabTrigger name='books' href='/books' asChild>
          <TabButton icon='📖' label='Books' />
        </TabTrigger>
        <TabTrigger name='settings' href='/settings' asChild>
          <TabButton icon='⚙️' label='Settings' />
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
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.two,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.65,
  },
  tabIcon: {
    textAlign: "center",
  },
});
