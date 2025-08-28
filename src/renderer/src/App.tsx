import List from "./components/List";
import { Watch } from "./components/Watch";

function App() {
  return (
    <main className="flex h-screen flex-col bg-[var(--color-neir-lighter)] p-1">
      <h1 className="text-4xl ">SMidi Musical Editor</h1>
      <Watch />
      <List />
    </main>
  );
}

export default App;
