// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Employees from "./pages/Employees";
import Cars from "./pages/Cars";
import CarEntries from "./pages/CarEntries";
import "./styles/index.css";

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user" element={<Users />} />
          <Route path="/employee" element={<Employees />} />
          <Route path="/car" element={<Cars />} />
          <Route path="/car-entry/*" element={<CarEntries />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
