import { useParams } from "@solidjs/router";
import { io } from "socket.io-client";
import { Component, onMount } from "solid-js";

import styles from "./playground.module.css";
import initGear3 from "./world";

const Playground: Component = () => {
  // TODO: maybe move all the socket logic to world.tsx
  let canvasRef: HTMLCanvasElement;
  const params = useParams();
  const socket = io("http://localhost:5000", {
    withCredentials: true,
  });

  onMount(() => {
    fetch("http://localhost:5000/session", { credentials: "include" }).then(
      () => {
        socket.on("connect", () => {
          initGear3(canvasRef, socket, params.id);
        });
      }
    );
  });

  return (
    <>
      <div class={styles.container}>
        <canvas ref={canvasRef} class={styles.game}></canvas>
      </div>
    </>
  );
};

export default Playground;
