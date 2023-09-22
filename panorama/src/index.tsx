/* @refresh reload */
import "./index.css";

import { Navigate, Route, Router, Routes } from "@solidjs/router";
import { render } from "solid-js/web";

import { Socket } from "socket.io-client";
import About from "./about/about";
import Login from "./auth/login";
import Home from "./home/home";
import Lobby from "./lobby/lobby";
import WaitingRoom from "./lobby/waiting-room";
import CornerNav from "./nav/corner-nav";
import Playground from "./redline/playground/playground";
import { GameMode } from "./shared/game-modes";

render(
  () => (
    <>
      <Router>
        <CornerNav />
        <Routes>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/about" component={About} />
          <Route path="/lobby" component={Lobby} />
          <Route path="/lobby/:id" component={WaitingRoom} />
          <Route
            path="/neo"
            element={
              <Playground
                debug={true}
                userID={"123"}
                gameID={"456"}
                socket={"1" as unknown as Socket}
                showGameFun={() => {}}
                mode={GameMode.Three}
              />
            }
          />
          <Route path="/*" element={<Navigate href="/" />} />
        </Routes>
      </Router>
    </>
  ),
  document.getElementById("root") as HTMLElement
);
