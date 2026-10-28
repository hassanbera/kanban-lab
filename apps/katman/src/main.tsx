import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { KanbanApp } from "./components/kanban-app";
import "./styles.css";
import { ShowcaseSwitcher } from "./components/showcase-switcher";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <>
      <KanbanApp brand="Katman" variant="katman" />
      <ShowcaseSwitcher current="katman" />
    </>
  </StrictMode>,
);
