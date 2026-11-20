import { useCallback, useState } from 'react';

export type Todo = {
  id: string;
  text: string;
  done: boolean;
};

let nextId = 1;

export function useTodos(initialTodos: Todo[] = []) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  const addTodo = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setTodos((prev) => [{ id: `todo-${nextId++}`, text: trimmed, done: false }, ...prev]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)));
  }, []);

  const removeTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const clearDone = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => !todo.done));
  }, []);

  return { todos, addTodo, toggleTodo, removeTodo, clearDone };
}
