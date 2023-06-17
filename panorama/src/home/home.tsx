import { A } from '@solidjs/router';
import { Component } from 'solid-js';

import akira_pill from '../assets/akira_pill.mp4';
import play from '../assets/play_water.gif';
import styles from './home.module.css';

const Home: Component = () => {
  return (
    <>
      <div class={styles.parent}>
        <div class="container">
          <div class={styles.content}>
            <A href="/lobby">
              <img id={styles.play} width="500px" src={play} />
            </A>
          </div>
        </div>
        <video
          id={styles.backgroundVideo}
          autoplay={true}
          loop={true}
          src={akira_pill}
        ></video>
      </div>
    </>
  );
};

export default Home;
