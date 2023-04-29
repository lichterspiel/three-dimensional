import styles from './playground.module.css'

import { Component, onMount } from "solid-js";
import { io } from "socket.io-client";

import initGear3 from "./world";
import { generateUUID } from 'three/src/math/MathUtils';

const Playground: Component = () => {
    let canvas: HTMLCanvasElement;
    const socket = io("http://localhost:5000");
    const gameId = generateUUID();

    socket.on("connect", () => {
        initGear3(canvas, socket, socket.id, gameId) 
    });


   onMount(() => {
    })

    return (<>
        <div class={styles.container}>
            <canvas ref={canvas} class={styles.game}></canvas>
        </div>
    </>)
}

export default Playground;
