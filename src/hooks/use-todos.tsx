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

    db.getAllAsync<TodoRow>(
      "SELECT todos.id, todos.list, todos.text, todos.done, todo_links.resource_type as link_type, todo_links.resource_id as link_resource_id FROM todos LEFT JOIN todo_links ON todo_links.todo_id = todos.id ORDER BY todos.created_at DESC",
    )
      .then((rows) => {
        if (!mounted) return;
        const next = { ...EMPTY_LISTS };
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
      })
      .catch(() => {});

    return () => {
      mounted = false;
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
