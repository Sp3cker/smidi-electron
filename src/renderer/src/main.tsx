import "./assets/main.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { onAppError } from "./ipcHandlers/appError";

// Start error listener as early as possible
onAppError();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
