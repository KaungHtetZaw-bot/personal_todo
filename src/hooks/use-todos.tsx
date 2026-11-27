import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSQLiteContext, type SQLiteDatabase } from "expo-sqlite";
import { subscribeResourcePack } from "@/resource-pack";

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  link?: TodoLink;
};
export type ListId = "home" | "learn" | "workout" | "books";
export type TodoLinkType = "learn_item" | "book" | "workout_routine" | "exercise";
export type TodoLink = { type: TodoLinkType; resourceId: string };

type TodoRow = {
  id: string;
  list: ListId;
  text: string;
  done: number;
  link_type: TodoLinkType | null;
  link_resource_id: string | null;
};
type TodosByList = Record<ListId, Todo[]>;

type TodosContextValue = {
  lists: TodosByList;
  addTodo: (list: ListId, text: string, link?: TodoLink) => void;
  setTodoLink: (list: ListId, id: string, link: TodoLink | null) => void;
  toggleTodo: (list: ListId, id: string) => void;
  removeTodo: (list: ListId, id: string) => void;
  clearDone: (list: ListId) => void;
};

const TodosContext = createContext<TodosContextValue | null>(null);
const EMPTY_LISTS: TodosByList = { home: [], learn: [], workout: [], books: [] };
let nextId = 1;

export function TodosProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [lists, setLists] = useState<TodosByList>(EMPTY_LISTS);

  useEffect(() => {
    let mounted = true;

    const ensureSampleTodos = async () => {
      const sampleTodoCount = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM todos WHERE id IN (?, ?, ?)",
        "todo-sample-english-grammar",
        "todo-sample-workout",
        "todo-sample-reading",
      );
      if (sampleTodoCount?.count === 3) return;

      const createdAt = Date.now();
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          "INSERT OR IGNORE INTO todos (id, list, text, done, position, created_at) VALUES (?, ?, ?, ?, ?, ?)",
          "todo-sample-english-grammar",
          "home",
          "Learn English grammar for 10 minutes",
          0,
          0,
          createdAt,
        );
        await db.runAsync(
          "INSERT OR IGNORE INTO todos (id, list, text, done, position, created_at) VALUES (?, ?, ?, ?, ?, ?)",
          "todo-sample-workout",
          "home",
          "Complete Workout Part 1",
          0,
          0,
          createdAt - 1,
        );
        await db.runAsync(
          "INSERT OR IGNORE INTO todos (id, list, text, done, position, created_at) VALUES (?, ?, ?, ?, ?, ?)",
          "todo-sample-reading",
          "home",
          "Read 10 pages",
          0,
          0,
          createdAt - 2,
        );
      });
    };

    const loadTodos = async () => {
      try {
        await ensureSampleTodos();
        const rows = await db.getAllAsync<TodoRow>(
          "SELECT todos.id, todos.list, todos.text, todos.done, todo_links.resource_type as link_type, todo_links.resource_id as link_resource_id FROM todos LEFT JOIN todo_links ON todo_links.todo_id = todos.id ORDER BY todos.created_at DESC",
        );
        if (!mounted) return rows.length;
        // Create new arrays as well as a new object. A shallow copy of
        // EMPTY_LISTS would mutate the original home array, leaving memoized
        // consumers such as TodoList with the old array reference.
        const next: TodosByList = { home: [], learn: [], workout: [], books: [] };
        rows.forEach((row) => {
          if (row.list in next) {
            next[row.list].push({
              id: row.id,
              text: row.text,
              done: row.done === 1,
              ...(row.link_type && row.link_resource_id
                ? { link: { type: row.link_type, resourceId: row.link_resource_id } }
                : {}),
            });
          }
        });
        setLists(next);
        return rows.length;
      } catch {
        return 0;
      }
    };

    void loadTodos().then((count) => {
      // A first-run migration can finish just after the provider mounts on a
      // warm development client. Retry once so seeded todos appear immediately.
      if (count === 0) {
        setTimeout(() => void loadTodos(), 150);
      }
    });
    const unsubscribe = subscribeResourcePack(() => void loadTodos());

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [db]);

  const addTodo = useCallback(
    (list: ListId, text: string, link?: TodoLink) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const id = `todo-${Date.now().toString(36)}-${nextId++}`;
      const todo: Todo = { id, text: trimmed, done: false, ...(link ? { link } : {}) };

      setLists((prev) => ({ ...prev, [list]: [todo, ...prev[list]] }));
      db.runAsync(
        "INSERT INTO todos (id, list, text, done, position, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        id,
        list,
        trimmed,
        0,
        0,
        Date.now(),
      ).catch(() => {});
      insertLink(db, id, link);
    },
    [db],
  );

  const setTodoLink = useCallback(
    (list: ListId, id: string, link: TodoLink | null) => {
      setLists((prev) => ({
        ...prev,
        [list]: prev[list].map((todo) =>
          todo.id === id ? { ...todo, ...(link ? { link } : { link: undefined }) } : todo,
        ),
      }));
      db.runAsync("DELETE FROM todo_links WHERE todo_id = ?", id).catch(() => {});
      insertLink(db, id, link);
    },
    [db],
  );

  const toggleTodo = useCallback(
    (list: ListId, id: string) => {
      setLists((prev) => ({
        ...prev,
        [list]: prev[list].map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo,
        ),
      }));
      db.runAsync("UPDATE todos SET done = CASE done WHEN 0 THEN 1 ELSE 0 END WHERE id = ?", id).catch(() => {});
    },
    [db],
  );

  const removeTodo = useCallback(
    (list: ListId, id: string) => {
      setLists((prev) => ({ ...prev, [list]: prev[list].filter((todo) => todo.id !== id) }));
      db.runAsync("DELETE FROM todos WHERE id = ?", id).catch(() => {});
    },
    [db],
  );

  const clearDone = useCallback(
    (list: ListId) => {
      setLists((prev) => ({ ...prev, [list]: prev[list].filter((todo) => !todo.done) }));
      db.runAsync("DELETE FROM todos WHERE list = ? AND done = 1", list).catch(() => {});
    },
    [db],
  );

  const value = useMemo(
    () => ({ lists, addTodo, setTodoLink, toggleTodo, removeTodo, clearDone }),
    [lists, addTodo, setTodoLink, toggleTodo, removeTodo, clearDone],
  );

  return <TodosContext.Provider value={value}>{children}</TodosContext.Provider>;
}

function insertLink(db: SQLiteDatabase, todoId: string, link?: TodoLink | null) {
  if (!link) return;
  db.runAsync(
    "INSERT OR REPLACE INTO todo_links (id, todo_id, resource_type, resource_id) VALUES (?, ?, ?, ?)",
    `link-${todoId}`,
    todoId,
    link.type,
    link.resourceId,
  ).catch(() => {});
}

export function useTodos(list: ListId = "home") {
  const ctx = useContext(TodosContext);
  if (!ctx) throw new Error("useTodos must be used within a TodosProvider");

  const { lists, addTodo, setTodoLink, toggleTodo, removeTodo, clearDone } = ctx;
  return useMemo(
    () => ({
      todos: lists[list],
      addTodo: (text: string, link?: TodoLink) => addTodo(list, text, link),
      setTodoLink: (id: string, link: TodoLink | null) => setTodoLink(list, id, link),
      toggleTodo: (id: string) => toggleTodo(list, id),
      removeTodo: (id: string) => removeTodo(list, id),
      clearDone: () => clearDone(list),
    }),
    [lists, list, addTodo, setTodoLink, toggleTodo, removeTodo, clearDone],
  );
}
