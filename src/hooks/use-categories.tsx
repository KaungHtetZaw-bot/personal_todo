import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSQLiteContext } from "expo-sqlite";

export type CategoryNode = {
  id: string;
  title: string;
  children: CategoryNode[];
};

type CategoryRow = {
  id: string;
  parent_id: string | null;
  title: string;
  position: number;
};

type CategoriesContextValue = {
  categories: CategoryNode[];
  addChild: (parentId: string | null, title: string) => void;
};

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

const SEED: CategoryNode[] = [
  {
    id: "cat-international",
    title: "International Language",
    children: [
      {
        id: "cat-english",
        title: "English",
        children: [
          { id: "topic-english-grammar", title: "Grammar & Translation", children: [] },
          { id: "topic-english-vocabulary", title: "Vocabulary", children: [] },
          { id: "topic-english-speaking", title: "Phonetics & Basic English Speaking", children: [] },
        ],
      },
      {
        id: "cat-japan",
        title: "Japan",
        children: [
          { id: "topic-japan-grammar", title: "Grammar & Translation", children: [] },
          { id: "topic-japan-vocabulary", title: "Vocabulary", children: [] },
          { id: "topic-japan-speaking", title: "Phonetics & Basic English Speaking", children: [] },
        ],
      },
      {
        id: "cat-korean",
        title: "Korean",
        children: [
          { id: "topic-korean-grammar", title: "Grammar & Translation", children: [] },
          { id: "topic-korean-vocabulary", title: "Vocabulary", children: [] },
          { id: "topic-korean-speaking", title: "Phonetics & Basic English Speaking", children: [] },
        ],
      },
    ],
  },
  {
    id: "cat-programming",
    title: "Programming Language",
    children: [
      {
        id: "cat-mobile",
        title: "Mobile",
        children: [{ id: "topic-kotlin", title: "Kotlin", children: [] }],
      },
    ],
  },
];

let nextId = 1;

function makeId(): string {
  return `node-${Date.now().toString(36)}-${nextId++}`;
}

function flatten(
  nodes: CategoryNode[],
  parentId: string | null = null,
): CategoryRow[] {
  return nodes.flatMap((node, position) => [
    { id: node.id, parent_id: parentId, title: node.title, position },
    ...flatten(node.children, node.id),
  ]);
}

function toTree(rows: CategoryRow[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>();
  rows.forEach((row) => nodes.set(row.id, { id: row.id, title: row.title, children: [] }));

  const roots: CategoryNode[] = [];
  rows.forEach((row) => {
    const node = nodes.get(row.id);
    if (!node) return;
    if (row.parent_id) {
      nodes.get(row.parent_id)?.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [categories, setCategories] = useState<CategoryNode[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const count = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM categories",
      );

      if (count?.count === 0) {
        for (const row of flatten(SEED)) {
          await db.runAsync(
            "INSERT INTO categories (id, parent_id, title, position) VALUES (?, ?, ?, ?)",
            row.id,
            row.parent_id,
            row.title,
            row.position,
          );
        }
      }

      const rows = await db.getAllAsync<CategoryRow>(
        "SELECT id, parent_id, title, position FROM categories ORDER BY parent_id, position",
      );
      if (mounted) setCategories(toTree(rows));
    }

    load().catch(() => {});
    return () => {
      mounted = false;
    };
  }, [db]);

  const addChild = useCallback(
    (parentId: string | null, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;

      const id = makeId();
      const siblings = parentId
        ? findNode(categories, parentId)?.children.length ?? 0
        : categories.length;
      const node = { id, title: trimmed, children: [] };

      setCategories((prev) => insertNode(prev, parentId, node));
      db.runAsync(
        "INSERT INTO categories (id, parent_id, title, position) VALUES (?, ?, ?, ?)",
        id,
        parentId,
        trimmed,
        siblings,
      ).catch(() => {});
    },
    [categories, db],
  );

  const value = useMemo(() => ({ categories, addChild }), [categories, addChild]);
  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

function findNode(nodes: CategoryNode[], id: string): CategoryNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return undefined;
}

function insertNode(nodes: CategoryNode[], parentId: string | null, child: CategoryNode): CategoryNode[] {
  if (parentId === null) return [...nodes, child];
  return nodes.map((node) =>
    node.id === parentId
      ? { ...node, children: [...node.children, child] }
      : { ...node, children: insertNode(node.children, parentId, child) },
  );
}

export function useCategories(): CategoriesContextValue {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error("useCategories must be used within a CategoriesProvider");
  return ctx;
}
