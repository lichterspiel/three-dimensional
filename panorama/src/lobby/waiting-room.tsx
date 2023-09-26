import { useNavigate, useParams } from "@solidjs/router";
import { Socket, io } from "socket.io-client";
import {
  Component,
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import Playground from "../redline/playground/playground";
import { API_BASE_URL, WS_BASE_URL } from "../shared/constants/statics";
import styles from "./waiting-room.module.css";

import lavalamp from "../assets/lavalamp.gif";
import { GameMode } from "../shared/game-modes";
import { Player } from "../shared/player-interface";
import { LobbyResponse } from "../shared/responses/lobby-response";

const WaitingRoom: Component = () => {
  const params = useParams();
  let socket: Socket;
  const navigate = useNavigate();
  const [userID, setUserID] = createSignal("");
  const [showGame, setShowGame] = createSignal(false);
  const [members, setMembers] = createSignal<Player[]>([]);
  const [player, setPlayer] = createSignal<Player>();
  const [canStartGame, setCanStartGame] = createSignal(false);
  const [mode, setMode] = createSignal(GameMode.Classic);
  const [isPrivate, setIsPrivate] = createSignal(true);

  function startGame() {
    socket.emit("start-game", { mode: mode() });
  }

  function toggleReady() {
    socket.emit("toggle-ready");
  }

  function toggleIsPrivate() {
    socket.emit("toggle-private");
  }

  function changeMode(
    e: Event & { currentTarget: HTMLInputElement; target: HTMLInputElement }
  ) {
    socket.emit("change-mode", { mode: e.target.value });
  }

  function changeSettings(): boolean {
    if (player()?.admin && !canStartGame()) {
      return true;
    }
    return false;
  }

  async function init() {
    const res = await fetch(`${API_BASE_URL}/joinLobby/${params.id}`, {
      credentials: "include",
    });
    const r = await res.json();
    setUserID(r["userID"]);

    if (!r["canJoin"]) {
      navigate("/lobby");
    }

    createWS();

    if (r["gameRunning"]) {
      setShowGame(true);
    }
  }

  function createWS() {
    socket = io(WS_BASE_URL, {
      withCredentials: true,
    });

    socket.emit("lobby-join");
    socket.on("lobby-joined", (r: LobbyResponse) => {
      setMembers([r.p1, r.p2]);
      let player = r.p1.id == userID() ? r.p1 : r.p2;
      setPlayer(player);
    });

    socket.on("game-started", () => {
      setShowGame(true);
    });

    socket.on("lobby-leave", (r: LobbyResponse) => {
      setMembers([r.p1, r.p2]);
      let player = r.p1.id == userID() ? r.p1 : r.p2;
      setPlayer(player);
    });

    socket.on("toggled-ready", (r: LobbyResponse) => {
      setMembers([r.p1, r.p2]);
      let player = r.p1.id == userID() ? r.p1 : r.p2;
      setPlayer(player);
    });

    socket.on("toggled-private", (r: { isPrivate: boolean }) => {
      setIsPrivate(r.isPrivate);
    });

    socket.on("refresh-lobby", (r: LobbyResponse) => {
      setMembers([r.p1, r.p2]);
      let player = r.p1.id == userID() ? r.p1 : r.p2;
      setPlayer(player);
    });

    socket.on("mode-changed", (r: { mode: GameMode }) => {
      setMode(r.mode);
    });

    socket.on("player-kicked", (r: { player: string }) => {
      if (player()?.id == r.player) {
        navigate("/lobby");
      }
    });
  }

  createEffect(() => {
    if (members()[0]?.ready && members()[1]?.ready && player()?.admin) {
      setCanStartGame(true);
    } else {
      setCanStartGame(false);
    }
  });
  onMount(() => {
    init();
  });

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
              <h1 id={styles.title}> Waiting Room </h1>
              <img src={lavalamp} class={styles.lavalamp} />
            </header>
            <div class={styles.seperator}></div>
            <div id={styles.waiting_room}>
              <div class={styles.settings}>
                <h2>Players ({members()?.filter((m) => m !== null).length})</h2>
                <h2>Settings</h2>
              </div>
              <div class={styles.waiting_content}>
                <Show when={members().length > 0}>
                  <div class={styles.players_container}>
                    <div class={styles.player_names}>
                      <h3
                        style={{
                          color: members()[0]?.ready ? "green" : "white",
                        }}
                      >
                        #1 {members()[0].name}
                      </h3>
                      <h3
                        style={{
                          color: members()[1]?.ready ? "green" : "white",
                        }}
                      >
                        #2{" "}
                        {members()[1] !== null
                          ? members()[1].name
                          : "Waiting ..."}
                      </h3>
                    </div>
                  </div>
                </Show>
                <div
                  class={styles.players_container}
                  style={{
                    "pointer-events": changeSettings() ? "all" : "none",
                    opacity: changeSettings() ? 1 : 0.3,
                  }}
                >
                  <div>
                    <label class={styles.game_mode}>
                      <input
                        type="radio"
                        name="mode"
                        value={GameMode.Classic}
                        onChange={(e) => changeMode(e)}
                        checked={mode() === GameMode.Classic}
                      />
                      Classic (3x3)
                    </label>
                    <label class={styles.game_mode}>
                      <input
                        type="radio"
                        name="mode"
                        value={GameMode.Three}
                        onChange={(e) => changeMode(e)}
                        checked={mode() === GameMode.Three}
                      />
                      3D (3x3x3)
                    </label>
                  </div>
                  <div>
                    <label class={styles.game_mode}>
                      <input
                        type="checkbox"
                        name="private"
                        value={"private"}
                        onChange={(e) => toggleIsPrivate()}
                        checked={isPrivate()}
                      />
                      Private Lobby
                    </label>
                  </div>
                </div>
              </div>
              <div class={styles.button_container}>
                <Switch>
                  <Match when={!canStartGame()}>
                    <button onClick={toggleReady} class={styles.button_start}>
                      {player()?.ready ? "Cancel" : "Ready"}
                    </button>
                  </Match>
                  <Match when={canStartGame()}>
                    <button onClick={startGame} class={styles.button_start}>
                      Start
                    </button>
                  </Match>
                </Switch>
              </div>
            </div>
          </div>
        </div>
      </Show>
      <Show when={showGame()}>
        <Playground
          userID={userID()}
          gameID={params.id}
          socket={socket!}
          showGameFun={setShowGame}
          debug={false}
          mode={mode()}
          p1Color={members()[0]?.color}
          p2Color={members()[1]?.color}
        />
      </Show>
    </>
  );
};

export default WaitingRoom;
