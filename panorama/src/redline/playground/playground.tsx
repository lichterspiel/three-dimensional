import { useNavigate, useParams } from "@solidjs/router";
import { io, Socket } from "socket.io-client";
import { Component, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";

import { API_BASE_URL, WS_BASE_URL } from "../../shared/constants/statics";
import GameGui from "../gameGui/game-gui";
import styles from "./playground.module.css";
import initGear3, { cleanupScene } from "./world";
import Modal from "../../shared/modal/modal";

export interface GameStatsI {
    turn: string;
    winner?: string;
    winnerString?: string;
}

const Playground: Component = () => {
    const [gameStats, setGameStats] = createStore<GameStatsI>({turn: ''});
    const [isModalOpen, setIsModalOpen] = createSignal(false);
    const params = useParams();
    const navigate = useNavigate();

    let canvasRef: HTMLCanvasElement | undefined;
    let socket: Socket;
    let csrfToken: string;

    async function initStuff() {
        const fe = await fetch(`${API_BASE_URL}/getcsrf`, 
            { credentials: "include",}
        );

        csrfToken = fe.headers.get("X-CSRFToken")!;

        const rq = await fetch(`${API_BASE_URL}/joinGame/${params.id}`, 
            { credentials: "include",}
        );
        const rqJson = await rq.json();

        if (!rqJson["canJoin"]) navigate("/lobby");

        socket = io(WS_BASE_URL, {
            withCredentials: true,
            extraHeaders: { "X-CSRFToken": csrfToken },
        });

        socket.on("connect", () => { initGear3(canvasRef!, socket, params.id, setGameStats) });
    }

    function handleSurrender(): void {
        socket.emit("player-surrender", { gameID: params.id });
    }

    // effect to check everytime the gameStats is updated if the game is finished
    createEffect(() => {
        if (gameStats.winner)
        {
            setIsModalOpen(true);
        }
    })

    onMount(() => {
        initStuff();
    });

    // clear the socket connection and close threejs renderer
    // i check if there is an connection because if the game never starts there is no connection ?
    onCleanup(() => {
        if (socket) {
            socket.disconnect();
            socket.close();
        }

        cleanupScene();
    });

    function revenge() {
        navigate("/lobby")
    }

    function navigateHome() {
        navigate("/lobby")
    }

    return (
        <>
            <div class={styles.container}>
                <canvas ref={canvasRef} class={styles.game}></canvas>
                <GameGui handleSurrender={handleSurrender} gameStats={gameStats} />
            </div>
            <Modal isOpen={isModalOpen()}
                    setIsOpen={setIsModalOpen}
                    fun1={navigateHome} 
                    fun2={revenge} 
                    cancelText="Home"
                    confirmText="Revenge">
               {gameStats.winner}
            </Modal>
        </>
    );
};

export default Playground;
