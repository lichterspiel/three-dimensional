import { useNavigate } from '@solidjs/router';
import { Component, onMount } from 'solid-js';
import { generateUUID } from 'three/src/math/MathUtils';

import styles from './lobby.module.css';
import tv from '../assets/red_tv.png';

/*
 * TODO: This component should show at the top 2 buttons one to create a game the other to join a game either via code 
 * or you can join directly via link
 * In the bottom should be a list of games where people can freely join
 */


const Lobby: Component = () => {
    const navigate = useNavigate();

   function createGame(): void{
        const gameId = generateUUID();
        navigate(`/game/${gameId}`)
    }

    function joinGame(): void{
        return
    }

    function handleButtonHover(e: MouseEvent): void {
        const target = e.target as HTMLButtonElement;
        if (!target)
            return

        const yRot = e.offsetX - target.offsetWidth / 2;
        const xRot = e.offsetY - target.offsetHeight / 2;
        
        target.style.transition = "";
        target.style.transform = `rotateY(${yRot / 3}deg) rotateX(${-1 * xRot / 3}deg)`;
    }

    function handleMouseLeave(e: MouseEvent): void {
        const target = e.target as HTMLButtonElement;
        if (!target)
            return


        target.style.removeProperty("transform");
        target.style.transition = "0.9s"
    }

    return (
    <>
        <div class="container" id={styles.content}>
            <div class={styles.buttonContainer}>
                <button class={`${styles.gameButton} ${styles.createButton}`} 
                    onClick={createGame} onMouseMove={handleButtonHover} onMouseLeave={handleMouseLeave}>create</button>
                <button class={`${styles.gameButton} ${styles.joinButton}`} 
                    onclick={joinGame} onMouseMove={handleButtonHover} onMouseLeave={handleMouseLeave}>join</button>
            </div>

            <div class={styles.game_rooms}>
                <h1>Rooms</h1>
                <img src={tv} id={styles.tv}/>
            </div>
        </div>
    </>
    )
}

export default Lobby;
