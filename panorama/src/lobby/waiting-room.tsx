import { useNavigate, useParams } from "@solidjs/router";
import { Component, Show, createSignal, onCleanup, onMount } from "solid-js";
import { API_BASE_URL, WS_BASE_URL } from "../shared/constants/statics";
import Playground from "../redline/playground/playground";
import styles from "./waiting-room.module.css"
import { Socket, io } from "socket.io-client";

const WaitingRoom: Component = () => {
    const params = useParams();
    let userID = "";
    let socket: Socket;
    const navigate = useNavigate();
    const [showGame, setShowGame] = createSignal(false);
    const [members, setMembers] = createSignal(0);

    async function startGame(){
        socket.emit("start-game")
    }

    async function init() {
        const res = await fetch(`${API_BASE_URL}/joinGame/${params.id}`, 
            { credentials: "include",}
        );
        const j = await res.json();
        userID = j["userID"]

        if (!j["canJoin"]) 
        {
            navigate("/lobby")
        }

        socket = io(WS_BASE_URL, {
            withCredentials: true,
        });

        socket.emit("lobby-join");
        if (j["gameRunning"]){
            setShowGame(true);
            //navigate(`/game/${gameID}`);
        }

        socket.on("lobby-joined", (r) => {
            setMembers(r["members"])
        })

        socket.on("game-started", (r) => {
            setShowGame(true);
        })
    }

   
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
        <div class={`container ${styles.content}`}>
            <Show when={!showGame()}>
                Players: {members()}/2
                <button onClick={startGame}>
                    StartGame
                </button>
            </Show>
            <Show when={showGame()}>
                <Playground userID={userID} gameID={params.id} socket={socket!} showGameFun={setShowGame}/>
            </Show>
        </div>
        
    </>
    )
}

export default WaitingRoom;
