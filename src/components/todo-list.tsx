import { ComponentRef, useCallback, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useTodos, type Todo } from "@/hooks/use-todos";
import { Spacing, useTheme } from "@/theme";
import { useFocusEffect } from "expo-router";

type TodoRowProps = {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

function TodoRow({ todo, onToggle, onRemove }: TodoRowProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          boxShadow: `3px 3px 0px ${theme.shadow}`,
        },
      ]}
    >
      <Pressable
        accessibilityRole='checkbox'
        accessibilityState={{ checked: todo.done }}
        accessibilityLabel={todo.text}
        onPress={() => onToggle(todo.id)}
        style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
      >
        <View
          style={[
            styles.checkbox,
            { borderColor: theme.border },
            todo.done && { backgroundColor: theme.accent },
          ]}
        >
          {todo.done && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text
          style={[
            styles.rowText,
            { color: todo.done ? theme.textMuted : theme.text },
            todo.done && styles.doneText,
          ]}
        >
          {todo.text}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole='button'
        accessibilityLabel={`Delete ${todo.text}`}
        hitSlop={Spacing.two}
        onPress={() => onRemove(todo.id)}
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.deleteGlyph, { color: theme.textSecondary }]}>
          ✕
        </Text>
      </Pressable>
    </View>
  );
}

export function TodoList() {
  const theme = useTheme();
  const { todos, addTodo, toggleTodo, removeTodo, clearDone } = useTodos();
  const [draft, setDraft] = useState("");

  const canAdd = draft.trim().length > 0;

  const submit = () => {
    if (!canAdd) return;
    addTodo(draft);
    setDraft("");
    inputRef.current?.focus();
  };

  const remaining = todos.filter((todo) => !todo.done).length;
  const hasDone = remaining < todos.length;

  // const inputRef = useRef<TextInput>(null);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);

  useFocusEffect(
    useCallback(() => {
      // A slight delay ensures the screen transition finishes
      // so the keyboard opens reliably (especially on Android)
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeout);
    }, []),
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[
          styles.addRow,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            boxShadow: `4px 4px 0px ${theme.shadow}`,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={submit}
          placeholder='Add a task…'
          placeholderTextColor={theme.textSecondary}
          returnKeyType='done'
          style={[styles.input, { color: theme.text }]}
        />
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Add todo'
          onPress={submit}
          disabled={!canAdd}
          style={({ pressed }) => [
            styles.submitButton,
            { backgroundColor: theme.plus, borderColor: theme.border },
            !canAdd && styles.submitDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.submitGlyph}>+</Text>
        </Pressable>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(todo) => todo.id}
        renderItem={({ item }) => (
          <TodoRow todo={item} onToggle={toggleTodo} onRemove={removeTodo} />
        )}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps='handled'
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Nothing here yet — your first task goes up top.
          </Text>
        }
      />

      <View style={styles.footer}>
        <View style={[styles.tag, { backgroundColor: theme.tagBg }]}>
          <Text style={[styles.tagText, { color: theme.tagText }]}>
            {remaining} {remaining === 1 ? "task" : "tasks"} left
          </Text>
        </View>
        {hasDone && (
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Clear completed todos'
            onPress={clearDone}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <View style={[styles.tag, { backgroundColor: theme.plus }]}>
              <Text style={[styles.tagText, { color: "#101010" }]}>
                Clear done
              </Text>
            </View>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderWidth: 3,
    borderRadius: 14,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.one,
    paddingVertical: Spacing.one,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    paddingVertical: Spacing.two,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  submitButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  submitDisabled: {
    opacity: 0.45,
  },
  submitGlyph: {
    color: "#101010",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 22,
  },
  listContent: {
    flexGrow: 1,
    gap: 12,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderWidth: 3,
    borderRadius: 14,
    paddingVertical: Spacing.two + Spacing.half,
    paddingHorizontal: Spacing.three,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.65,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#101010",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 16,
  },
  rowText: {
    flex: 1,
    fontSize: 15.5,
    lineHeight: 22,
    fontWeight: "800",
  },
  doneText: {
    textDecorationLine: "line-through",
  },
  deleteButton: {
    padding: Spacing.one,
  },
  deleteGlyph: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  emptyText: {
    paddingVertical: Spacing.five,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.one,
  },
  tag: {
    borderRadius: 7,
    paddingVertical: 6,
    paddingHorizontal: 11,
  },
  tagText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
