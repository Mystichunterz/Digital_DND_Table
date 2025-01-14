//----------------------
// src > App.jsx
//----------------------

//----------------------
//  imports
//----------------------
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Router from "./Router";

//----------------------
//  main
//----------------------
const App = () => {
  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
};

//----------------------
//  exports
//----------------------
export default App;
