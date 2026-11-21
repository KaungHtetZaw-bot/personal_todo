import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** A node in the Learn category tree. Leaves have `children: []`. */
export type CategoryNode = {
  id: string;
  title: string;
  children: CategoryNode[];
};

type CategoriesContextValue = {
  categories: CategoryNode[];
  /** Adds a child under `parentId`, or a top-level category when `null`. */
  addChild: (parentId: string | null, title: string) => void;
};

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

// Bumped to v2 so stale trees saved during earlier testing don't mask the seed.
const STORAGE_KEY = "todo.learn.categories.v2";

const SEED: CategoryNode[] = [
  {
    id: "cat-international",
    title: "International Language",
    children: [
      {
        id: "cat-english",
        title: "English",
        children: [
          { id: "topic-grammar", title: "Grammar & Translation", children: [] },
          { id: "topic-vocabulary", title: "Vocabulary", children: [] },
          {
            id: "topic-phonetics",
            title: "Phonetics & Basic English Speaking",
            children: [],
          },
        ],
      },
      {
        id: "cat-japan",
        title: "Japan",
        children: [
          { id: "topic-grammar", title: "Grammar & Translation", children: [] },
          { id: "topic-vocabulary", title: "Vocabulary", children: [] },
          {
            id: "topic-phonetics",
            title: "Phonetics & Basic English Speaking",
            children: [],
          },
        ],
      },
      {
        id: "cat-korean",
        title: "Korean",
        children: [
          { id: "topic-grammar", title: "Grammar & Translation", children: [] },
          { id: "topic-vocabulary", title: "Vocabulary", children: [] },
          {
            id: "topic-phonetics",
            title: "Phonetics & Basic English Speaking",
            children: [],
          },
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

function insertChild(
  nodes: CategoryNode[],
  parentId: string | null,
  child: CategoryNode,
): CategoryNode[] {
  if (parentId === null) return [...nodes, child];
  return nodes.map((node) =>
    node.id === parentId
      ? { ...node, children: [...node.children, child] }
      : { ...node, children: insertChild(node.children, parentId, child) },
  );
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<CategoryNode[]>(SEED);
  const hydrated = useRef(false);

  // Hydrate the persisted tree after mount (keeps SSR/hydration deterministic).
  useEffect(() => {
    let mounted = true;
    AsyncStorage.clear();
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!mounted) return;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              setCategories(parsed as CategoryNode[]);
            }
          } catch {
            // Corrupt storage — fall back to the seed.
          }
        }
        hydrated.current = true;
      })
      .catch(() => {
        if (mounted) hydrated.current = true;
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Persist any change made after hydration (the seed itself is written lazily).
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(categories)).catch(
      () => {},
    );
  }, [categories]);

  const addChild = useCallback((parentId: string | null, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setCategories((prev) =>
      insertChild(prev, parentId, {
        id: makeId(),
        title: trimmed,
        children: [],
      }),
    );
  }, []);

  const value = useMemo(
    () => ({ categories, addChild }),
    [categories, addChild],
  );

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories(): CategoriesContextValue {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return ctx;
}
