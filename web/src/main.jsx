import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store";
import "./styles/global.css";
import Router from "./routes/router";

const App = () => {
  return (
    <Provider store={store}>
      <Router />
    </Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
