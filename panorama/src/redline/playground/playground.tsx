import { useNavigate } from "@solidjs/router";
import { Socket } from "socket.io-client";
import {
    Component,
    Setter,
    createEffect,
    createSignal,
    onCleanup,
    onMount,
} from "solid-js";
import { createStore } from "solid-js/store";

import Modal from "../../shared/modal/modal";
import GameGui from "../gameGui/game-gui";
import styles from "./playground.module.css";
import initGear3, { cleanupScene } from "./world";
import { GameMode } from "../../shared/game-modes";

export interface GameStatsI {
  turn: string;
  winner?: string;
  winnerString?: string;
}

interface PlaygroundProps {
  userID: string;
  gameID: string;
  socket: Socket;
  showGameFun: Setter<boolean>;
  debug: boolean;
  mode: GameMode;
  p1Color: number;
  p2Color: number;
}

const Playground: Component<PlaygroundProps> = (props) => {
  const [gameStats, setGameStats] = createStore<GameStatsI>({ turn: "" });
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const navigate = useNavigate();

  let canvasRef: HTMLCanvasElement | undefined;
  let socket: Socket | undefined = props.socket;

  async function initStuff() {
    /*
        const fe = await fetch(`${API_BASE_URL}/getcsrf`, 
            { credentials: "include",}
        );

        csrfToken = fe.headers.get("X-CSRFToken")!;
        */

    if (props.debug){
        initGear3(canvasRef!, socket, "black-lemonade", "blondey", setGameStats, props.debug, GameMode.Three, 0xffffff, 0x000000);
    }
    else {
        initGear3(canvasRef!, socket, props.gameID, props.userID, setGameStats, props.debug, props.mode, props.p1Color, props.p2Color);
    }
  }

  function handleSurrender(): void {
      if (props.debug && socket){
        socket.emit("player-surrender");
      }
  }

  // effect to check everytime the gameStats is updated if the game is finished
  createEffect(() => {
    if (gameStats.winner) {
      setIsModalOpen(true);
    }
  });

  onMount(() => {
    initStuff();
  });

  // clear the socket connection and close threejs renderer
  // i check if there is an connection because if the game never starts there is no connection ?
  onCleanup(() => {
    cleanupScene();
  });

  function revenge() {
    if (!props.debug && props.showGameFun){ 
        props.showGameFun(false);
    }
  }

  function navigateHome() {
    navigate("/lobby");
  }

  return (
    <>
      <div class={styles.container}>
        <canvas ref={canvasRef} class={styles.game}></canvas>
        <GameGui handleSurrender={handleSurrender} gameStats={gameStats} />
      </div>
      <Modal
        isOpen={isModalOpen()}
        setIsOpen={setIsModalOpen}
        fun1={navigateHome}
        fun2={revenge}
        cancelText="Home"
        confirmText="Revenge"
      >
        {gameStats.winner}
      </Modal>
    </>
  );
};

export default Playground;
