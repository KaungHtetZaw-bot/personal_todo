import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SectionLabel } from "@/components/section-label";
import {
  DESIGN_OPTIONS,
  MaxContentWidth,
  Spacing,
  THEME_MODE_OPTIONS,
  boxShadow,
  typeStyle,
  useDesign,
  useTheme,
} from "@/theme";

type RowProps = {
  label: string;
  value?: string;
  children?: ReactNode;
};

function Row({ label, value, children }: RowProps) {
  const theme = useTheme();
  const { tokens } = useDesign();
  const item = tokens.item;
  const isCard = item.style === "card";

  return (
    <View
      style={[
        styles.row,
        isCard
          ? {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: item.borderWidth,
              borderRadius: item.radius,
              paddingVertical: item.paddingV,
              paddingHorizontal: item.paddingH,
              gap: item.gap,
              boxShadow: boxShadow(item.shadow, theme.shadow),
            }
          : {
              paddingVertical: item.paddingV,
              paddingHorizontal: item.paddingH,
              gap: item.gap,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            },
      ]}
    >
      <Text style={[typeStyle(item.text), { color: theme.text, flex: 1 }]}>
        {label}
      </Text>
      {value != null && (
        <Text style={[styles.rowValue, { color: theme.textSecondary }]}>
          {value}
        </Text>
      )}
      {children}
    </View>
  );
}

type DesignOption = (typeof DESIGN_OPTIONS)[number];

function DesignOptionRow({
  option,
  onSelect,
}: {
  option: DesignOption;
  onSelect?: () => void;
}) {
  const theme = useTheme();
  const { design, setDesign, tokens } = useDesign();
  const item = tokens.item;
  const selected = design === option.id;
  const isCard = item.style === "card";

  return (
    <Pressable
      accessibilityRole='radio'
      accessibilityState={{ checked: selected }}
      accessibilityLabel={option.label}
      onPress={() => {
        setDesign(option.id);
        onSelect?.();
      }}
      style={({ pressed }) => [
        styles.option,
        isCard
          ? {
              backgroundColor: selected ? theme.tagBg : theme.surface,
              borderColor: selected ? theme.accent : theme.border,
              borderWidth: selected
                ? Math.max(item.borderWidth, 2)
                : item.borderWidth,
              borderRadius: item.radius,
              paddingVertical: item.paddingV,
              paddingHorizontal: item.paddingH,
              gap: item.gap,
              boxShadow: boxShadow(item.shadow, theme.shadow),
            }
          : {
              backgroundColor: selected ? theme.tagBg : "transparent",
              paddingVertical: item.paddingV,
              paddingHorizontal: item.paddingH,
              gap: item.gap,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.swatches}>
        {option.swatch.map((color) => (
          <View
            key={color}
            style={[
              styles.swatch,
              { backgroundColor: color, borderColor: theme.border },
            ]}
          />
        ))}
      </View>

      <View style={styles.optionText}>
        <Text
          style={[
            typeStyle(item.text),
            { color: selected ? theme.accent : theme.text },
          ]}
        >
          {option.label}
        </Text>
        <Text
          style={[
            styles.optionDesc,
            {
              fontSize: Math.max(item.text.size - 2, 12),
              lineHeight: Math.max(item.text.lineHeight - 3, 16),
              color: theme.textSecondary,
            },
          ]}
        >
          {option.description}
        </Text>
      </View>

      {selected && (
        <Text style={[styles.check, { color: theme.accent }]}>✓</Text>
      )}
    </Pressable>
  );
}

function DesignDropdown() {
  const theme = useTheme();
  const { design, tokens } = useDesign();
  const [open, setOpen] = useState(false);
  const item = tokens.item;
  const isCard = item.style === "card";
  const selected =
    DESIGN_OPTIONS.find((option) => option.id === design) ?? DESIGN_OPTIONS[0];

  return (
    <View>
      <Pressable
        accessibilityRole='button'
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`Design: ${selected.label}`}
        accessibilityHint='Shows the list of designs'
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => [
          styles.option,
          isCard
            ? {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                borderWidth: item.borderWidth,
                borderRadius: item.radius,
                paddingVertical: item.paddingV,
                paddingHorizontal: item.paddingH,
                gap: item.gap,
                boxShadow: boxShadow(item.shadow, theme.shadow),
              }
            : {
                backgroundColor: theme.surface,
                paddingVertical: item.paddingV,
                paddingHorizontal: item.paddingH,
                gap: item.gap,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.swatches}>
          {selected.swatch.map((color) => (
            <View
              key={color}
              style={[
                styles.swatch,
                { backgroundColor: color, borderColor: theme.border },
              ]}
            />
          ))}
        </View>

        <View style={styles.optionText}>
          <View style={styles.optionTitleRow}>
            <Text style={[typeStyle(item.text), { color: theme.text }]}>
              {selected.label}
            </Text>
            <View
              style={[styles.activeBadge, { backgroundColor: theme.tagBg }]}
            >
              <Text style={[styles.activeBadgeText, { color: theme.tagText }]}>
                Active
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.optionDesc,
              {
                fontSize: Math.max(item.text.size - 2, 12),
                lineHeight: Math.max(item.text.lineHeight - 3, 16),
                color: theme.textSecondary,
              },
            ]}
          >
            {selected.description}
          </Text>
        </View>

        <Text
          style={[
            styles.chevron,
            {
              color: theme.textSecondary,
              transform: [{ rotate: open ? "180deg" : "0deg" }],
            },
          ]}
        >
          ▾
        </Text>
      </Pressable>

      {open && (
        <View
          style={[
            styles.dropdownList,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderRadius: Math.max(item.radius, 12),
              borderWidth: 1,
              marginTop: Spacing.two,
              padding: Spacing.two,
              gap: Math.max(item.listGap, Spacing.two),
            },
          ]}
        >
          {DESIGN_OPTIONS.map((option) => (
            <DesignOptionRow
              key={option.id}
              option={option}
              onSelect={() => setOpen(false)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function AppearanceRow() {
  const theme = useTheme();
  const { mode, setMode, tokens } = useDesign();
  const nav = tokens.nav;

  return (
    <Row label='Appearance'>
      <View
        style={[
          styles.segment,
          {
            backgroundColor: theme.tagBg,
            borderColor: theme.border,
            borderWidth: Math.max(nav.borderWidth, 1),
            borderRadius: nav.radius,
          },
        ]}
      >
        {THEME_MODE_OPTIONS.map((option) => {
          const selected = mode === option.id;

          return (
            <Pressable
              key={option.id}
              accessibilityRole='radio'
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`Appearance: ${option.label}`}
              onPress={() => setMode(option.id)}
              style={({ pressed }) => [
                styles.segmentItem,
                {
                  backgroundColor: selected ? theme.surface : "transparent",
                  borderColor: selected ? theme.accent : "transparent",
                  borderWidth: selected ? Math.max(nav.borderWidth, 1) : 0,
                  borderRadius: nav.itemRadius,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  typeStyle(nav.label),
                  {
                    fontSize: Math.max(nav.label.size, 12),
                    lineHeight: Math.max(nav.label.lineHeight, 16),
                    color: selected ? theme.text : theme.textSecondary,
                  },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Row>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const { tokens } = useDesign();
  const [notifications, setNotifications] = useState(true);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scroll}>
          <View style={styles.header}>
            <Text style={[typeStyle(tokens.title), { color: theme.text }]}>
              Settings
            </Text>
            <Text
              style={[
                typeStyle(tokens.subtitle),
                { color: theme.textSecondary },
              ]}
            >
              Make it yours.
            </Text>
          </View>

          <View style={styles.sections}>
            <SectionLabel>Design</SectionLabel>
            <DesignDropdown />

            <SectionLabel>Preferences</SectionLabel>

            <Row label='Notifications'>
              <Pressable
                accessibilityRole='switch'
                accessibilityState={{ checked: notifications }}
                accessibilityLabel='Notifications'
                onPress={() => setNotifications((value) => !value)}
                style={({ pressed }) => [
                  styles.switch,
                  {
                    borderColor: theme.border,
                    borderWidth: tokens.checkbox.borderWidth,
                    backgroundColor: notifications
                      ? theme.accent
                      : theme.surface,
                    justifyContent: notifications ? "flex-end" : "flex-start",
                  },
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.knob,
                    {
                      backgroundColor: notifications
                        ? theme.onAccent
                        : theme.textSecondary,
                    },
                  ]}
                />
              </Pressable>
            </Row>

            <AppearanceRow />

            <SectionLabel>About</SectionLabel>

            <Row label='Version' value='1.0.0' />
            <Row label='Made with' value='Expo' />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    height: "100%",
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  scroll: {
    flex: 1,
  },
  header: {
    gap: Spacing.one,
    paddingBottom: Spacing.four,
  },
  sections: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowValue: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
  },
  swatches: {
    flexDirection: "row",
    gap: 6,
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  activeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  activeBadgeText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dropdownList: {},
  optionDesc: {
    fontWeight: "400",
  },
  chevron: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "700",
  },
  check: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900",
  },
  switch: {
    width: 52,
    height: 30,
    flexDirection: "row",
    borderRadius: 15,
    paddingHorizontal: 3,
    alignItems: "center",
  },
  knob: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  pressed: {
    opacity: 0.65,
  },
  segment: {
    flexDirection: "row",
    padding: 3,
    gap: 3,
  },
  segmentItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
