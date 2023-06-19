import { Component, Show } from 'solid-js';

import styles from './game-gui.module.css';

const GameGui: Component<{ gameStats: { turn: string } | null, handleSurrender: Function }> = (props) => {

  return (
    <>
    <Show when={props.gameStats !== null}>
          <div class={styles.gui}>
            <button id={styles.quit} onClick={() => props.handleSurrender()}>Surrender</button>
            <div id={styles.turn}>Turn: {props.gameStats["turn"]}</div>
          </div>
      </Show>
    </>
  );
};

export default GameGui;
