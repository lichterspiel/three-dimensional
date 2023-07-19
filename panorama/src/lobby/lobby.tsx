import { useNavigate } from "@solidjs/router";
import { Component, createResource, For, onMount, Show } from "solid-js";

import graffitiLine from "../assets/LineGraffiti.png";
import welcome from "../assets/Welcome.png";
import { API_BASE_TEST_URL, API_BASE_URL } from "../shared/constants/statics";
import styles from "./lobby.module.css";

/*
 * TODO: This component should show at the top 2 buttons one to create a game the other to join a game either via code
 * or you can join directly via link
 * In the bottom should be a list of games where people can freely join
 */

async function getLobbies(){
    const res = await fetch(`${API_BASE_TEST_URL}/lobbies`, { credentials: "include" })
    const j = await res.json()
    return j;
}

async function getRunningGame() {
    const res = await fetch(`${API_BASE_URL}/runningGame`, { credentials: "include" })
    const j = await res.json()
    if (!j["runningGame"]) { return null }
    return j;
}

const Lobby: Component = () => {
    const [lobbies] = createResource<GameLobby[]>(getLobbies, {initialValue: []});
    const [runningGame] = createResource<GameLobby>(getRunningGame);
    const navigate = useNavigate();

    onMount(() => {
        getLobbies();
        getRunningGame();
    });

    function createGame() {
        fetch(`${API_BASE_URL}/createGame`, { credentials: "include" })
            .then((r) => r.json())
            .catch((e) => console.log(e))
            .then((r) => {
                navigate(`/game/${r.gameID}`);
            });
    }

    async function joinGame(gameID: string) {
        const rq = await fetch(`${API_BASE_URL}/joinGame/${gameID}`, {
            credentials: "include",
        });
        const rqJson = await rq.json();

        if (rqJson["canJoin"]) {
            navigate(`/game/${gameID}`);
        }
    }

    function openJoinDialog(): void {}

    function handleButtonHover(e: MouseEvent): void {
        const target = e.target as HTMLButtonElement;
        if (!target) return;

        const yRot = e.offsetX - target.offsetWidth / 2;
        const xRot = e.offsetY - target.offsetHeight / 2;

        target.style.transition = "";
        target.style.transform = `rotateY(${yRot / 3}deg) rotateX(${(-1 * xRot) / 3}deg)`;
    }

    function handleMouseLeave(e: MouseEvent): void {
        const target = e.target as HTMLButtonElement;
        if (!target) return;

        target.style.removeProperty("transform");
        target.style.transition = "0.9s";
    }

    return (
        <>
            <div id={styles.background_image}></div>
            <div class="container" id={styles.container_background}>
                <div id={styles.content}>
                    <header id={styles.header}>
                        <img src={graffitiLine} id={styles.graffiti_line_l} />
                        <img src={welcome} id={styles.welcome} />
                        <img src={graffitiLine} id={styles.graffiti_line_r} />
                    </header>
                    <div class={styles.button_container}>
                        <button
                            class={`${styles.game_button} ${styles.create_button}`}
                            onClick={createGame}
                            onMouseMove={handleButtonHover}
                            onMouseLeave={handleMouseLeave}
                        >
                            create
                        </button>
                    <Show when={runningGame()}>
                        <button
                            onclick={() => joinGame(runningGame()!["gameID"])}
                            class={`${styles.game_button} ${styles.current_game}`}
                            onMouseMove={handleButtonHover}
                            onMouseLeave={handleMouseLeave}
                            >
                                resume 
                            </button>
                        </Show>
                    </div>
                    <div class={styles.rooms}>
                        <h1 id={styles.rooms_heading}>Open Rooms</h1>
                        <div class={styles.rooms_container}>
                            <ul class={styles.rooms_list}>
                                <Show when={ lobbies() && lobbies().length > 0} fallback={<h2>Loading....</h2>}>
                                    <For each={lobbies()}>
                                        {(lobby, i) => (
                                            <li
                                            onclick={() => joinGame(lobby.gameID)}
                                            class={styles.room}
                                            >
                                                <div>Player: {lobby.p1}</div>
                                                <div>Game ID: {lobby.gameID}</div>
                                                <div>{lobby.members} / 2</div>
                                            </li>
                                        )}
                                    </For>
                                </Show>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Lobby;
