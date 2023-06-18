import { useParams, useNavigate } from "@solidjs/router";
import { Socket, io } from "socket.io-client";
import { Component, createSignal, onCleanup, onMount } from "solid-js";

import GameGui from "./game-gui";
import initGear3, { cleanupScene } from "./world";

import styles from "./playground.module.css";
import { API_BASE_URL, WS_BASE_URL } from "../shared/statics";

const Playground: Component = () => {
  const [gameStats, setGameStats] = createSignal(null);
  const params = useParams();
  const navigate = useNavigate();

  let canvasRef: HTMLCanvasElement | undefined;
  let socket: Socket;
  let csrfToken: string;

 
 async function initStuff(){
    const fe = await fetch(`${API_BASE_URL}/getcsrf`, {credentials: "include",})
    csrfToken = fe.headers.get("X-CSRFToken")!;
    const rq = await fetch(`${API_BASE_URL}/joinGame/${params.id}`, {credentials: "include",})
    const rqJson = await rq.json();
    console.log(rqJson);
    

    if (!rqJson['canJoin']){
        console.log("here");
        
        navigate('/lobby');
    }

    socket = io(WS_BASE_URL, {
      withCredentials: true,
      extraHeaders: {
        "X-CSRFToken": csrfToken,
      },
     });

    socket.on("connect", () => {
      initGear3(canvasRef!, socket, params.id, gameStats(), setGameStats);
    });

  }

  onMount(() => {
      initStuff();
  });

  onCleanup(() => {
    if (socket){
        socket.disconnect();
        socket.close();

    }

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
