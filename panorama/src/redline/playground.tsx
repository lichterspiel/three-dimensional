import styles from './playground.module.css';

import { Component, onMount } from "solid-js";
import { io } from "socket.io-client";

import initGear3 from "./world";
import { useParams } from '@solidjs/router';
import { generateUUID } from 'three/src/math/MathUtils';

const Playground: Component = () => {
    // TODO: maybe move all the socket logic to world.tsx
    let canvas: HTMLCanvasElement;
    const params = useParams();
    const socket = io("http://localhost:5000",
    {
        withCredentials: true,
    });

   onMount(() => {
        fetch("http://localhost:5000/session", {credentials: "include"})
            .then(() => {
                socket.on("connect", () => {
                    let req = {gameId: params.id}
                    socket.emit('player-join', req)
                    initGear3(canvas, socket, params.id) 
                });
        })
    })

    return (<>
        <div class={styles.container}>
            <canvas ref={canvas} class={styles.game}></canvas>
        </div>
    </>)
}

export default Playground;
