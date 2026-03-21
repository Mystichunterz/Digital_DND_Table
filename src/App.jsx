//----------------------
// src > App.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { BrowserRouter } from "react-router-dom";
import Router from "./Router";
import VersionSwitcher from "./components/VersionSwitcher";

//----------------------
//  main
//----------------------
const App = () => {
  return (
    <BrowserRouter>
      <VersionSwitcher />
      <Router />
    </BrowserRouter>
  );
};

//----------------------
//  exports
//----------------------
export default App;
