
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import LaunchStore from "./LaunchStore";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LaunchStore />
  </StrictMode>
);
