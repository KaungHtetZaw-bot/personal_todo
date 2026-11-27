import { useCallback, useEffect, useMemo, useState } from "react";
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

import { SectionLabel } from "@/components/section-label";
import { useTodos, type ListId, type Todo } from "@/hooks/use-todos";
import { boxShadow, Spacing, typeStyle, useDesign, useTheme } from "@/theme";
import { useFocusEffect } from "expo-router";

type ListEntry =
  | { kind: "header"; key: string; label: string }
  | { kind: "todo"; key: string; todo: Todo };

type TodoRowProps = {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  showSeparator: boolean;
};

function TodoRow({ todo, onToggle, onRemove, showSeparator }: TodoRowProps) {
  const theme = useTheme();
  const { tokens } = useDesign();
  const item = tokens.item;
  const box = tokens.checkbox;
  const isCard = item.style === "card";

  const checkRadius =
    box.shape === "circle"
      ? box.size / 2
      : box.shape === "rounded"
        ? box.size * 0.32
        : 3;

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
              borderBottomWidth: showSeparator ? 1 : 0,
              borderBottomColor: theme.border,
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
            {
              width: box.size,
              height: box.size,
              borderRadius: checkRadius,
              borderWidth: box.borderWidth,
              borderColor: theme.border,
            },
            todo.done && {
              backgroundColor: theme.accent,
              borderColor: theme.accent,
            },
          ]}
        >
          {todo.done && (
            <Text
              style={[
                styles.checkmark,
                {
                  color: theme.onAccent,
                  fontSize: box.checkSize,
                  lineHeight: box.checkSize + 3,
                },
              ]}
            >
              ✓
            </Text>
          )}
        </View>
        <Text
          style={[
            typeStyle(item.text),
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

type TodoListProps = {
  /** Which tab's list this component edits. Defaults to 'home'. */
  list?: ListId;
};

export function TodoList({ list = "home" }: TodoListProps) {
  const theme = useTheme();
  const { tokens } = useDesign();
  const { todos, addTodo, toggleTodo, removeTodo, clearDone } = useTodos(list);
  const [draft, setDraft] = useState("");

  const canAdd = draft.trim().length > 0;

  const submit = () => {
    if (!canAdd) return;
    addTodo(draft);
    alert(listData);
    setDraft("");
  };

  const remaining = todos.filter((todo) => !todo.done).length;
  const hasDone = remaining < todos.length;

  useFocusEffect(
    useCallback(() => {
      // A slight delay ensures the screen transition finishes
      // so the keyboard opens reliably (especially on Android)
      const timeout = setTimeout(() => {}, 100);

      return () => clearTimeout(timeout);
    }, []),
  );

  const listData = useMemo<ListEntry[]>(() => {
    if (!tokens.header.sections) {
      return todos.map((todo) => ({
        kind: "todo" as const,
        key: todo.id,
        todo,
      }));
    }

    const active = todos.filter((todo) => !todo.done);
    const finished = todos.filter((todo) => todo.done);
    const entries: ListEntry[] = [];

    if (active.length > 0) {
      entries.push({ kind: "header", key: "header-active", label: "Today" });
      active.forEach((todo) =>
        entries.push({ kind: "todo", key: todo.id, todo }),
      );
    }
    if (finished.length > 0) {
      entries.push({ kind: "header", key: "header-done", label: "Done" });
      finished.forEach((todo) =>
        entries.push({ kind: "todo", key: todo.id, todo }),
      );
    }
    return entries;
  }, [todos, tokens.header.sections]);

  useEffect(() => {
    console.log("listData changed:", listData);
  }, [listData]);

  const add = tokens.add;
  const isHairline = add.style === "hairline";
  const inputSize = add.style === "slim" ? 14 : 15;
  const footer = tokens.footer;
  const footerText = {
    fontSize: footer.size,
    lineHeight: footer.size + 5,
    fontWeight: footer.weight,
    textTransform: (footer.uppercase ? "uppercase" : "none") as
      | "uppercase"
      | "none",
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[
          styles.addRow,
          isHairline
            ? {
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
                paddingVertical: Spacing.two,
              }
            : {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                borderWidth: add.borderWidth,
                borderRadius: add.radius,
                paddingVertical: add.style === "pill" ? 6 : Spacing.one,
                paddingLeft:
                  add.style === "pill" ? Spacing.four : Spacing.three,
                paddingRight: add.style === "pill" ? 6 : Spacing.one,
                boxShadow: boxShadow(add.shadow, theme.shadow),
              },
        ]}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={submit}
          placeholder='Add a task…'
          placeholderTextColor={theme.textSecondary}
          returnKeyType='done'
          style={[
            styles.input,
            {
              color: theme.text,
              fontSize: inputSize,
              lineHeight: inputSize + 7,
              fontWeight: add.inputWeight,
            },
          ]}
        />
        {isHairline ? (
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Add todo'
            onPress={submit}
            disabled={!canAdd}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Text
              style={[
                styles.addText,
                { color: canAdd ? theme.accent : theme.textMuted },
              ]}
            >
              Add
            </Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Add todo'
            onPress={submit}
            disabled={!canAdd}
            style={({ pressed }) => [
              styles.submitButton,
              {
                width: add.buttonSize,
                height: add.buttonSize,
                borderRadius: add.buttonRadius,
                borderWidth: add.buttonBorderWidth,
                borderColor: theme.border,
                backgroundColor: theme.plus,
              },
              !canAdd && styles.submitDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.submitGlyph,
                {
                  color: theme.onPlus,
                  fontSize: Math.round(add.buttonSize * 0.58),
                  lineHeight: Math.round(add.buttonSize * 0.58) + 3,
                },
              ]}
            >
              +
            </Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={listData}
        keyExtractor={(entry) => entry.key}
        renderItem={({ item, index }) => {
          if (item.kind === "header") {
            return <SectionLabel>{item.label}</SectionLabel>;
          }
          const next = listData[index + 1];
          const showSeparator =
            tokens.item.style === "row" && next?.kind === "todo";
          return (
            <TodoRow
              todo={item.todo}
              onToggle={toggleTodo}
              onRemove={removeTodo}
              showSeparator={showSeparator}
            />
          );
        }}
        contentContainerStyle={[
          styles.listContent,
          { gap: tokens.item.listGap },
        ]}
        keyboardShouldPersistTaps='handled'
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Nothing here yet — your first task goes up top.
            {listData.map((list) => (
              <View key={list.key}>{list.key}</View>
            ))}
          </Text>
        }
      />

      <View style={styles.footer}>
        {footer.style === "tag" ? (
          <>
            <View
              style={[
                styles.tag,
                { backgroundColor: theme.tagBg, borderRadius: footer.radius },
              ]}
            >
              <Text style={[footerText, { color: theme.tagText }]}>
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
                <View
                  style={[
                    styles.tag,
                    {
                      backgroundColor: theme.plus,
                      borderRadius: footer.radius,
                    },
                  ]}
                >
                  <Text style={[footerText, { color: theme.onPlus }]}>
                    Clear done
                  </Text>
                </View>
              </Pressable>
            )}
          </>
        ) : (
          <>
            <Text style={[footerText, { color: theme.textSecondary }]}>
              {remaining} {remaining === 1 ? "task" : "tasks"} left
            </Text>
            {hasDone && (
              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Clear completed todos'
                onPress={clearDone}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={[footerText, { color: theme.accent }]}>
                  Clear done
                </Text>
              </Pressable>
            )}
          </>
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
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.two,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  addText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  submitButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  submitDisabled: {
    opacity: 0.45,
  },
  submitGlyph: {
    fontWeight: "900",
  },
  listContent: {
    flexGrow: 1,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontWeight: "900",
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
    paddingVertical: 6,
    paddingHorizontal: 11,
  },
});
