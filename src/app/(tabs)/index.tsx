import { TodoScreen } from "@/components/todo-screen";

export default function HomeScreen() {
  return (
    <TodoScreen
      list='home'
      title='My Todos'
      subtitle='Tap a task to mark it done.'
    />
  );
}
