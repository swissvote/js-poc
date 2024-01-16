import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Layout from "./layout";
import App from "./app";
import { basename } from "./config";
import WebSocketComponent from "./ws";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <Layout>
        <App />
        <WebSocketComponent />
      </Layout>
    </BrowserRouter>
  </React.StrictMode>
);
