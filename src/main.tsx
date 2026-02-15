import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CharacterConfigProvider } from "@/config/CharacterConfigProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CharacterConfigProvider>
      <App />
    </CharacterConfigProvider>
  </StrictMode>,
);
