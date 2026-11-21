import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TodoList } from "@/components/todo-list";
import { useTodos, type ListId } from "@/hooks/use-todos";
import { MaxContentWidth, Spacing, typeStyle, useDesign, useTheme } from "@/theme";

type TodoScreenProps = {
  /** Which tab's list this screen edits. */
  list: ListId;
  title: string;
  /** Shown under the title when the active design has no progress header. */
  subtitle: string;
};

export function TodoScreen({ list, title, subtitle }: TodoScreenProps) {
  const theme = useTheme();
  const { tokens } = useDesign();
  const { todos } = useTodos(list);

  const remaining = todos.filter((todo) => !todo.done).length;
  const done = todos.length - remaining;
  const percent = todos.length === 0 ? 0 : Math.round((done / todos.length) * 100);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[typeStyle(tokens.title), { color: theme.text }]}>{title}</Text>
          <Text style={[typeStyle(tokens.subtitle), { color: theme.textSecondary }]}>
            {tokens.header.progress
              ? `${remaining} open · ${done} done`
              : subtitle}
          </Text>

          {tokens.header.progress && (
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: theme.border, borderRadius: tokens.footer.radius },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.accent,
                    borderRadius: tokens.footer.radius,
                    width: `${percent}%`,
                  },
                ]}
              />
            </View>
          )}
        </View>

        <TodoList list={list} />
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
  header: {
    gap: Spacing.one,
    paddingBottom: Spacing.four,
  },
  progressTrack: {
    height: 6,
    width: "100%",
    marginTop: Spacing.two,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
});
