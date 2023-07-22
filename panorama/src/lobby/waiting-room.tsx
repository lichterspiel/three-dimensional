import { useNavigate, useParams } from "@solidjs/router";
import { Socket, io } from "socket.io-client";
import { Component, Show, createSignal, onCleanup, onMount } from "solid-js";
import Playground from "../redline/playground/playground";
import { API_BASE_URL, WS_BASE_URL } from "../shared/constants/statics";
import styles from "./waiting-room.module.css";

import lavalamp from "../assets/lavalamp.gif";

const WaitingRoom: Component = () => {
  const params = useParams();
  let userID = "";
  let socket: Socket;
  const navigate = useNavigate();
  const [showGame, setShowGame] = createSignal(false);
  const [members, setMembers] = createSignal(0);
  const [canStartGame, setCanStartGame] = createSignal(false);

  async function startGame() {
    socket.emit("start-game");
  }

  async function init() {
    const res = await fetch(`${API_BASE_URL}/joinLobby/${params.id}`, {
      credentials: "include",
    });
    const j = await res.json();
    userID = j["userID"];

    if (!j["canJoin"]) {
      navigate("/lobby");
    }

    socket = io(WS_BASE_URL, {
      withCredentials: true,
    });

    socket.emit("lobby-join");
    if (j["gameRunning"]) {
      setShowGame(true);
      //navigate(`/game/${gameID}`);
    }

    socket.on("lobby-joined", (r: LobbyResponse) => {
      setMembers(r.members);
      if (r.p1 == userID) setCanStartGame(true);
    });

    socket.on("game-started", () => {
      setShowGame(true);
    });

    socket.on("lobby-leave", (r: LobbyResponse) => {
      setMembers(r["members"]);
      if (r.p1 == userID) setCanStartGame(true);
    });
  }

  function disableButton() {
    if (members() == 2 && canStartGame()) {
      return false;
    } else return true;
  }

  onMount(() => {});

  onCleanup(() => {
    if (socket) {
      socket.disconnect();
      socket.close();
    }
  });

  return (
    <>
      <Show when={!showGame()}>
        <div id={styles.background_image}></div>
        <div class={`container`}>
          <div class={styles.content}>
            <header class={styles.header}>
              <img src={lavalamp} class={styles.lavalamp} />
              <h2 id={styles.title}> Waiting Room </h2>
              <img src={lavalamp} class={styles.lavalamp} />
            </header>
            <div id={styles.waiting_room}>
              Players: {members()}/2
              <button onClick={startGame} disabled={disableButton()}>
                StartGame
              </button>
            </div>
          </div>
        </div>
      </Show>
      <Show when={showGame()}>
        <Playground
          userID={userID}
          gameID={params.id}
          socket={socket!}
          showGameFun={setShowGame}
        />
      </Show>
    </>
  );
};

export default WaitingRoom;
