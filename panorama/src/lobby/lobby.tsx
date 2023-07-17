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
    const json = await res.json()
    return json;
}

async function getRunningGame() {
    const res = await fetch(`${API_BASE_URL}/runningGame`, { credentials: "include" })
    const json = await res.json()
    if (json == '') return undefined
    return json;
}

const Lobby: Component = () => {
    const [lobbies] = createResource<GameLobby[]>(getLobbies);
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
                        <img src={graffitiLine} id={styles.graffitiLineL} />
                        <img src={welcome} id={styles.welcome} />
                        <img src={graffitiLine} id={styles.graffitiLineR} />
                    </header>
                    <div class={styles.buttonContainer}>
                        <button
                            class={`${styles.gameButton} ${styles.createButton}`}
                            onClick={createGame}
                            onMouseMove={handleButtonHover}
                            onMouseLeave={handleMouseLeave}
                        >
                            create
                        </button>
                        <button
                            class={`${styles.gameButton} ${styles.joinButton}`}
                            onclick={openJoinDialog}
                            onMouseMove={handleButtonHover}
                            onMouseLeave={handleMouseLeave}
                        >
                            join
                        </button>
                    </div>

                    <div class={styles.current_game_container}>
                        <Show when={runningGame()}>
                            <div
                                onclick={() => joinGame(runningGame()!["gameID"])}
                                class={styles.current_game}
                            >
                                <div>Resume Game</div>
                            </div>
                        </Show>
                    </div>

                    <div class={styles.game_rooms}>
                        <h1 id={styles.rooms_heading}>Rooms</h1>
                        <ul class={styles.lobby_list}>
                            <For each={lobbies()}>
                                {(lobby, i) => (
                                    <li
                                        onclick={() => joinGame(lobby.gameID)}
                                        class={styles.lobby_element}
                                    >
                                        <div>Player: {lobby.p1}</div>
                                        <div>Game ID: {lobby.gameID}</div>
                                        <div>{lobby.members} / 2</div>
                                    </li>
                                )}
                            </For>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Lobby;
