//----------------------
// src > App.jsx
//----------------------

//----------------------
//  imports
//----------------------
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
