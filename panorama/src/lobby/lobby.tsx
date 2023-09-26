import { useNavigate } from "@solidjs/router";
import { Component, createResource, createSignal, For, onMount, Show } from "solid-js";

import graffitiLine from "../assets/LineGraffiti.png";
import welcome from "../assets/Welcome.png";
import { GameLobby } from "../redline/response-interface";
import { API_BASE_URL } from "../shared/constants/statics";
import styles from "./lobby.module.css";

async function getLobbies() {
    const res = await fetch(`${API_BASE_URL}/lobbies`, {
        credentials: "include",
    });
    const j = await res.json();
    return j;
}

const Lobby: Component = () => {
    const [lobbies] = createResource<GameLobby[]>(getLobbies, {
        initialValue: [],
    });
    const navigate = useNavigate();
    const [user, setUser] = createSignal({})

    async function getUserSettings() {
        let res = await fetch(`${API_BASE_URL}/user`, {
            credentials: "include",
        });
        let j = await res.json()
        console.log(j);
        
        setUser(j)
    }

    async function changeUserSettings(e: Event) {
        e.preventDefault();

        let form = e.target as HTMLFormElement;
        let username = form.elements["newUserName"] as HTMLInputElement;
        let color = form.elements["newColor"] as HTMLInputElement;
        if (username.value == "" && color.value == "") {
            return;
        }

        let res = await fetch(`${API_BASE_URL}/user`, {
            method: "POST",
            credentials: "include",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "name": username.value,
                "color": color.value,
            }),
        });
        let j = await res.json()
        if (j["success"]) setUser({"name": username.value, "color": color.value})
    }

    async function createGame() {
        let res = await fetch(`${API_BASE_URL}/createLobby`, {
            credentials: "include",
        });
        let j = await res.json();
        navigate(`/lobby/${j.gameID}`);
    }

    async function joinGame(gameID: string) {
        const rq = await fetch(`${API_BASE_URL}/joinLobby/${gameID}`, {
            credentials: "include",
        });
        const rqJson = await rq.json();

        if (rqJson["canJoin"]) {
            navigate(`/lobby/${gameID}`);
        }
    }

    function handleButtonHover(e: MouseEvent): void {
        const target = e.target as HTMLButtonElement;
        if (!target) return;

        const yRot = e.offsetX - target.offsetWidth / 2;
        const xRot = e.offsetY - target.offsetHeight / 2;

        target.style.transition = "";
        target.style.transform = `rotateY(${yRot / 3}deg) rotateX(${(-1 * xRot) / 3
            }deg)`;
    }

    function handleMouseLeave(e: MouseEvent): void {
        const target = e.target as HTMLButtonElement;
        if (!target) return;

        target.style.removeProperty("transform");
        target.style.transition = "0.9s";
    }

    onMount(() => {
        getUserSettings()
    })

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
                    </div>
                    <div class={styles.rooms}>
                        <div>
                            <form onSubmit={changeUserSettings} class={styles.user_form}>
                                <input id="newUserName" type="text" placeholder="Enter your Name" maxlength="19" value={user()["name"]} />
                                <input id="newColor" type="color" value={user()["color"]}/>
                                <button type="submit">Save</button>
                            </form>
                        </div>
                        <h1 id={styles.rooms_heading}>Open Rooms</h1>
                        <div class={styles.rooms_container}>
                            <ul class={styles.rooms_list}>
                                <Show
                                    when={lobbies() && lobbies().length > 0}
                                    fallback={<h2>Loading....</h2>}
                                >
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
                    <div id={styles.lobby_footer}></div>
                </div>
            </div>
        </>
    );
};

export default Lobby;
