import { useNavigate } from '@solidjs/router';
import { Component, createSignal, For, onMount } from 'solid-js';

import tv from '../assets/red_tv.png';
import styles from './lobby.module.css';

/*
 * TODO: This component should show at the top 2 buttons one to create a game the other to join a game either via code
 * or you can join directly via link
 * In the bottom should be a list of games where people can freely join
 */

const Lobby: Component = () => {
  const [lobbies, setLobbies] = createSignal<GameLobby[] | null>(null);
  const navigate = useNavigate();

  onMount(() => {
    getLobbies();
  });

  function createGame(): void {
      fetch(`${API_BASE_URL}/createGame`)
      .then(r => r.json())
      .catch(e => console.log(e))
      .then(r => {
            navigate(`/game/${r.gameID}`);
      })
  }

  function joinGame(gameID: string): void {
    navigate(`/game/${gameID}`);
  }

  function openJoinDialog(): void {
  }

  function getLobbies(): void {
    fetch("http://localhost:5000/apiT/lobbies", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((r) => r.json())
      .then((r: GameLobby[]) => {
        console.log(r);

        setLobbies(r);
      });
  }

  function handleButtonHover(e: MouseEvent): void {
    const target = e.target as HTMLButtonElement;
    if (!target) return;

    const yRot = e.offsetX - target.offsetWidth / 2;
    const xRot = e.offsetY - target.offsetHeight / 2;

    target.style.transition = "";
    target.style.transform = `rotateY(${yRot / 3}deg) rotateX(${
      (-1 * xRot) / 3
    }deg)`;
  }

  function handleMouseLeave(e: MouseEvent): void {
    const target = e.target as HTMLButtonElement;
    if (!target) return;

    target.style.removeProperty("transform");
    target.style.transition = "0.9s";
  }

  return (
    <>
      <div class="container" id={styles.content}>
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

        <div class={styles.game_rooms}>
          <h1>Rooms</h1>
          <img src={tv} id={styles.tv} />
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
    </>
  );
};

export default Lobby;
