import { useParams, useNavigate } from "@solidjs/router";
import { Socket, io } from "socket.io-client";
import { Component, createSignal, onCleanup, onMount } from "solid-js";

import GameGui from "./game-gui";
import initGear3, { cleanupScene } from "./world";

import styles from "./playground.module.css";

const Playground: Component = () => {
  const [gameStats, setGameStats] = createSignal(null);
  const params = useParams();
  const navigate = useNavigate();

  let canvasRef: HTMLCanvasElement | undefined;
  let socket: Socket;
  let csrfToken: string;

  const csrf = () => {
    fetch(`${API_BASE_URL}/getcsrf`, {
      credentials: "include",
    })
      .then((res) => {
        csrfToken = res.headers.get("X-CSRFToken")!;
        // console.log(csrfToken);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  async function initStuff(){
    const fe = await fetch(`${API_BASE_URL}/getcsrf`, {credentials: "include",})
    const rq = await fetch(`${API_BASE_URL}/joinGame/${params.id}`, {credentials: "include",})
    const rqJson = await rq.json();

    if (!rqJson.canJoin){
        navigate('/lobby');
        return;
    }

    socket = io(WS_BASE_URL, {
      withCredentials: true,
      extraHeaders: {
        "X-CSRFToken": csrfToken,
      },
     });

    socket.on("connect", () => {
      console.log("connect");
      initGear3(canvasRef!, socket, params.id, gameStats(), setGameStats);
    });

  }

  onMount(() => {
      initStuff();
  });

  onCleanup(() => {
    socket.disconnect();
    socket.close();

    cleanupScene();
  });

  return (
    <>
      <div class={styles.container}>
        <canvas ref={canvasRef} class={styles.game}></canvas>
        <div id={styles.gameStats}>
          <GameGui gameStats={gameStats()} />
        </div>
      </div>
    </>
  );
};

export default Playground;
