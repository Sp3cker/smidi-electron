import { Watch } from "./components/Watch";

function App() {
  return (
    <main className="flex h-screen flex-col bg-zinc-800 p-1">
      <h1 className="text-4xl font-bold text-stone-100">SMidi</h1>
      <Watch />
    </main>
  );
}

export default App;
