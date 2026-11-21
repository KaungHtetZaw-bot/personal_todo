import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryTree, InlineAddRow } from "@/components/category-tree";
import { useCategories, type CategoryNode } from "@/hooks/use-categories";
import { MaxContentWidth, Spacing, typeStyle, useDesign, useTheme } from "@/theme";

export default function LearnScreen() {
  const theme = useTheme();
  const { tokens } = useDesign();
  const { addChild, categories } = useCategories();

  const topicCount = countLeaves(categories);
  const categoryCount = categories.length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          keyboardShouldPersistTaps='handled'
        >
          <View style={styles.header}>
            <Text style={[typeStyle(tokens.title), { color: theme.text }]}>Learn</Text>
            <Text
              style={[
                typeStyle(tokens.subtitle),
                { color: theme.textSecondary },
              ]}
            >
              Build a clear path from curiosity to practice.
            </Text>
          </View>

          <View
            style={[
              styles.overview,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View>
              <Text style={[styles.overviewEyebrow, { color: theme.textMuted }]}>YOUR LIBRARY</Text>
              <Text style={[styles.overviewTitle, { color: theme.text }]}>Keep learning in small steps.</Text>
            </View>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: theme.text }]}>{categoryCount}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>paths</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: theme.text }]}>{topicCount}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>topics</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>LEARNING PATHS</Text>
            <InlineAddRow
              compact
              label='Add path'
              onAdd={(title) => addChild(null, title)}
            />
          </View>

          <CategoryTree />
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
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
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
  overview: {
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.three,
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  overviewEyebrow: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  overviewTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
    marginTop: Spacing.one,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.two,
  },
  sectionHint: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },
});

function countLeaves(nodes: CategoryNode[]): number {
  return nodes.reduce(
    (total, node) =>
      total + (node.children.length === 0 ? 1 : countLeaves(node.children)),
    0,
  );
}
