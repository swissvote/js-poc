import { Route, Routes } from "react-router-dom";

import Home from "./vote/local";
import NotFound from "./not-found";

import links from "./links";
import WebSocketComponent from "./vote/ws";

export default () => {
  return (
    <Routes>
      <Route path={links.home.link} element={<Home />} />
      <Route path={links.websocket.link} element={<WebSocketComponent />} />
      <Route path={"/:any"} element={<NotFound />} />
    </Routes>
  );
};
