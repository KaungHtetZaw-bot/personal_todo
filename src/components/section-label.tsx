import { StyleSheet, Text, View, type StyleProp, type TextStyle } from "react-native";

import { Spacing, useDesign, useTheme } from "@/theme";

type SectionLabelProps = {
  children: string;
  style?: StyleProp<TextStyle>;
};

/**
 * Section heading that follows the active design:
 * sticker tag (bold), pastel pill (soft), hairline underline (minimal), tiny label (compact).
 */
export function SectionLabel({ children, style }: SectionLabelProps) {
  const theme = useTheme();
  const { tokens } = useDesign();
  const section = tokens.section;

  const textStyle: StyleProp<TextStyle> = [
    styles.text,
    {
      fontSize: section.size,
      lineHeight: section.size + 5,
      fontWeight: section.weight,
      textTransform: section.uppercase ? "uppercase" : "none",
      letterSpacing: section.letterSpacing,
      color:
        section.style === "tag" || section.style === "pill"
          ? theme.tagText
          : theme.textMuted,
    },
    style,
  ];

  if (section.style === "tag" || section.style === "pill") {
    return (
      <View
        style={[
          styles.tag,
          { backgroundColor: theme.tagBg, borderRadius: section.radius },
        ]}
      >
        <Text style={textStyle}>{children}</Text>
      </View>
    );
  }

  return (
    <Text
      style={[
        styles.plain,
        textStyle,
        section.style === "underline" && {
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: "700",
  },
  tag: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 11,
    marginTop: Spacing.one,
  },
  plain: {
    alignSelf: "flex-start",
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
    paddingBottom: Spacing.one,
  },
});
