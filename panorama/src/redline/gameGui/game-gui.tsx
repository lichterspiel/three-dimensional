import { Component} from 'solid-js';

import styles from './game-gui.module.css';
import { GameStatsI } from '../playground/playground';

interface GameGuiProps {
    gameStats: GameStatsI;
    handleSurrender: Function;
}

const GameGui: Component<GameGuiProps> = (props) => {

  return (
    <>
        <div id={styles.background}>
            <div class={styles.gui}>
              <button id={styles.quit} onClick={() => props.handleSurrender()}>Surrender</button>
              <div id={styles.turn}>Turn: {props.gameStats.turn || "loading turn..."}</div>
            </div>
        </div>
    </>
  );
};

export default GameGui;
