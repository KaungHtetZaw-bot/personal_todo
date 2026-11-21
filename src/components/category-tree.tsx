import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { SectionLabel } from "@/components/section-label";
import { useCategories, type CategoryNode } from "@/hooks/use-categories";
import { Spacing, boxShadow, typeStyle, useDesign, useTheme } from "@/theme";

type InlineAddRowProps = {
  label: string;
  onAdd: (title: string) => void;
  /** Smaller variant for use beside a heading (e.g. the Learn title). */
  compact?: boolean;
};

/** Inline "+ Add …" row that expands into a small input form. */
export function InlineAddRow({
  label,
  onAdd,
  compact = false,
}: InlineAddRowProps) {
  const theme = useTheme();
  const { tokens } = useDesign();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const radius = Math.max(tokens.item.radius, 8);
  const borderWidth = Math.max(tokens.item.borderWidth, 1);

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setDraft("");
    setAdding(false);
  };

  const cancel = () => {
    setDraft("");
    setAdding(false);
  };

  if (!adding) {
    return (
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={label}
        onPress={() => setAdding(true)}
        style={({ pressed }) => [
          styles.addRow,
          compact && styles.addRowCompact,
          {
            backgroundColor: theme.tagBg,
            borderColor: theme.border,
            borderWidth,
            borderRadius: radius,
          },
          pressed && styles.pressed,
        ]}
      >
        <Text
          style={[
            styles.addGlyph,
            compact && styles.addLabelCompact,
            { color: theme.accent },
          ]}
        >
          +
        </Text>
        <Text
          style={[
            styles.addLabel,
            compact && styles.addLabelCompact,
            { color: theme.accent },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.addForm,
        compact && styles.addFormCompact,
        {
          backgroundColor: theme.surface,
          borderColor: theme.accent,
          borderWidth,
          borderRadius: radius,
        },
      ]}
    >
      <TextInput
        autoFocus
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={submit}
        placeholder={label}
        placeholderTextColor={theme.textSecondary}
        returnKeyType='done'
        style={[
          styles.addInput,
          compact && styles.addInputCompact,
          { color: theme.text },
        ]}
      />
      <Pressable
        accessibilityRole='button'
        accessibilityLabel='Save'
        disabled={!draft.trim()}
        onPress={submit}
        style={({ pressed }) => [styles.addSubmit, pressed && styles.pressed]}
      >
        <Text
          style={[
            styles.addSubmitText,
            { color: draft.trim() ? theme.accent : theme.textMuted },
          ]}
        >
          Add
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole='button'
        accessibilityLabel='Cancel'
        onPress={cancel}
        style={({ pressed }) => [styles.addCancel, pressed && styles.pressed]}
      >
        <Text style={[styles.addSubmitText, { color: theme.textSecondary }]}>
          ✕
        </Text>
      </Pressable>
    </View>
  );
}

type NodeRowProps = {
  node: CategoryNode;
  depth: number;
  /** null = nothing toggled yet: nodes with children start open, leaves closed. */
  expanded: string[] | null;
  onToggle: (id: string) => void;
};

function NodeRow({ node, depth, expanded, onToggle }: NodeRowProps) {
  const theme = useTheme();
  const { tokens } = useDesign();
  const item = tokens.item;
  const hasChildren = node.children.length > 0;
  const isTopLevel = depth === 0;
  // Cards are reserved for expandable subjects. Leaf topics read as a quieter
  // list so a path does not become a wall of nested boxes.
  const isCard = item.style === "card" && hasChildren;
  const open = expanded === null ? hasChildren : expanded.includes(node.id);

  const rowStyle = isCard
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
      };

  return (
    <View
      style={{
        marginLeft: isTopLevel ? 0 : depth === 1 ? 0 : Spacing.three,
      }}
    >
      {isTopLevel ? (
        <Pressable
          accessibilityRole='button'
          accessibilityState={{ expanded: open }}
          accessibilityLabel={`${node.title} learning path`}
          onPress={() => onToggle(node.id)}
          style={({ pressed }) => [
            styles.pathHeader,
            { borderBottomColor: theme.border },
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.pathTitle}>
            <SectionLabel>{node.title}</SectionLabel>
            <Text style={[styles.pathMeta, { color: theme.textSecondary }]}> 
              {node.children.length} {node.children.length === 1 ? "subject" : "subjects"}
            </Text>
          </View>
          <Text
            style={[
              styles.chevron,
              { color: theme.textSecondary, transform: [{ rotate: open ? "180deg" : "0deg" }] },
            ]}
          >
            ▾
          </Text>
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole='button'
          accessibilityState={{ expanded: false }}
          accessibilityLabel={node.title}
          onPress={() => onToggle(node.id)}
          style={({ pressed }) => [
            styles.row,
            rowStyle,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.chevron,
              hasChildren
                ? {
                    color: theme.textSecondary,
                    transform: [{ rotate: open ? "180deg" : "0deg" }],
                  }
                : { color: theme.textMuted },
            ]}
          >
            {hasChildren ? "▾" : "•"}
          </Text>

          <Text
            style={[typeStyle(item.text), { color: theme.text, flex: 1 }]}
            numberOfLines={2}
          >
            {node.title}
          </Text>

          {hasChildren && (
            <Text style={[styles.count, { color: theme.textSecondary }]}>
              {node.children.length}
            </Text>
          )}
        </Pressable>
      )}

      {open && (
        <View
          style={{
            marginTop: Spacing.two,
            gap: item.listGap > 0 ? item.listGap : Spacing.one,
          }}
        >
          {node.children.map((child) => (
            <NodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function collectExpandable(
  nodes: CategoryNode[],
  into: string[] = [],
): string[] {
  for (const node of nodes) {
    if (node.children.length > 0) into.push(node.id);
    collectExpandable(node.children, into);
  }
  return into;
}

export function CategoryTree() {
  const theme = useTheme();
  const { tokens } = useDesign();
  const { categories } = useCategories();
  // null = nothing toggled yet → nodes with children start expanded.
  const [expanded, setExpanded] = useState<string[] | null>(null);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev ?? collectExpandable(categories));
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return [...next];
    });
  };

  return (
    <View style={styles.list}>
      {categories.map((node) => (
        <View
          key={node.id}
          style={[
            styles.path,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderRadius: tokens.item.radius,
              borderWidth: Math.max(tokens.item.borderWidth, 1),
            },
          ]}
        >
          <NodeRow
            node={node}
            depth={0}
            expanded={expanded}
            onToggle={toggle}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
  path: {
    overflow: "hidden",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  pathHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingBottom: Spacing.two,
  },
  pathTitle: {
    flex: 1,
    gap: 2,
  },
  pathMeta: {
    fontSize: 12,
    lineHeight: 16,
    marginLeft: Spacing.one,
  },
  titleSpacer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  chevron: {
    width: 16,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  count: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  addRowCompact: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  addGlyph: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
  },
  addLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  addLabelCompact: {
    fontSize: 13,
    lineHeight: 18,
  },
  addForm: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.one,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
  },
  addFormCompact: {
    alignSelf: "stretch",
    paddingVertical: 2,
    paddingLeft: Spacing.two,
    paddingRight: Spacing.one,
  },
  addInput: {
    flex: 1,
    paddingVertical: Spacing.two,
    fontSize: 15,
    lineHeight: 22,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  addInputCompact: {
    paddingVertical: Spacing.one,
    fontSize: 14,
    lineHeight: 20,
  },
  addSubmit: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  addCancel: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  addSubmitText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.65,
  },
});
