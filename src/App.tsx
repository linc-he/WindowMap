import { WindowMapOverlay } from "./components/WindowMapOverlay";
import "./App.css";

function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-transparent select-none">
      <WindowMapOverlay />
    </div>
  );
}

export default App;
