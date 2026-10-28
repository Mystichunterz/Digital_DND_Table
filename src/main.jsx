//----------------------
// src > main.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./app/App.jsx";

//----------------------
//  main
//----------------------
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
