import { useParams } from "@solidjs/router";
import { io } from "socket.io-client";
import { Component, createSignal, onMount } from "solid-js";
import { generateUUID } from 'three/src/math/MathUtils';

import styles from "./playground.module.css";
import initGear3 from "./world";

const Playground: Component = () => {
  // TODO: maybe move all the socket logic to world.tsx
  const [turn, setTurn] = createSignal(0);
  let canvasRef: HTMLCanvasElement;
  const params = useParams();
  const socket = io("http://localhost:5000", {
    withCredentials: true,
  });

  onMount(() => {
        socket.on("connect", () => {
          initGear3(canvasRef, socket, params.id, setTurn);
        });
      }
    )

  return (
    <>
      <div class={styles.container}>
        <canvas ref={canvasRef} class={styles.game}></canvas>
        <div id={styles.gameStats}>
            <div>{turn()}</div>
        </div>
      </div>
    </>
  );
};

export default Playground;
