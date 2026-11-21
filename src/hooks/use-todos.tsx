import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Todo = {
  id: string;
  text: string;
  done: boolean;
};

/** Each bottom-tab list keeps its own independent set of todos. */
export type ListId = 'home' | 'learn' | 'workout' | 'books';

type TodosContextValue = {
  lists: Record<ListId, Todo[]>;
  addTodo: (list: ListId, text: string) => void;
  toggleTodo: (list: ListId, id: string) => void;
  removeTodo: (list: ListId, id: string) => void;
  clearDone: (list: ListId) => void;
};

const TodosContext = createContext<TodosContextValue | null>(null);

let nextId = 1;

const EMPTY_LISTS: Record<ListId, Todo[]> = {
  home: [],
  learn: [],
  workout: [],
  books: [],
};

export function TodosProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<Record<ListId, Todo[]>>(EMPTY_LISTS);

  const addTodo = useCallback((list: ListId, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setLists((prev) => ({
      ...prev,
      [list]: [{ id: `todo-${nextId++}`, text: trimmed, done: false }, ...prev[list]],
    }));
  }, []);

  const toggleTodo = useCallback((list: ListId, id: string) => {
    setLists((prev) => ({
      ...prev,
      [list]: prev[list].map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    }));
  }, []);

  const removeTodo = useCallback((list: ListId, id: string) => {
    setLists((prev) => ({
      ...prev,
      [list]: prev[list].filter((todo) => todo.id !== id),
    }));
  }, []);

  const clearDone = useCallback((list: ListId) => {
    setLists((prev) => ({
      ...prev,
      [list]: prev[list].filter((todo) => !todo.done),
    }));
  }, []);

  const value = useMemo(
    () => ({ lists, addTodo, toggleTodo, removeTodo, clearDone }),
    [lists, addTodo, toggleTodo, removeTodo, clearDone],
  );

  return <TodosContext.Provider value={value}>{children}</TodosContext.Provider>;
}

/**
 * Access one list's todos with list-bound action callbacks.
 * Defaults to the 'home' list, so existing call sites keep working.
 */
export function useTodos(list: ListId = 'home'): {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  clearDone: () => void;
} {
  const ctx = useContext(TodosContext);
  if (!ctx) {
    throw new Error('useTodos must be used within a TodosProvider');
  }

  const { lists, addTodo, toggleTodo, removeTodo, clearDone } = ctx;

  return useMemo(
    () => ({
      todos: lists[list],
      addTodo: (text: string) => addTodo(list, text),
      toggleTodo: (id: string) => toggleTodo(list, id),
      removeTodo: (id: string) => removeTodo(list, id),
      clearDone: () => clearDone(list),
    }),
    [lists, list, addTodo, toggleTodo, removeTodo, clearDone],
  );
}
