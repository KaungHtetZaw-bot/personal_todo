import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TodoList } from "@/components/todo-list";
import { MaxContentWidth, Spacing, useTheme } from "@/theme";

export default function HomeScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>My Todos</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Tap a task to mark it done.
          </Text>
        </View>

        <TodoList />
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
  title: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
});
