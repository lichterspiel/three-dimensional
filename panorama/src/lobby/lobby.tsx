import { A, useNavigate } from '@solidjs/router';
import { Component, onMount, createSignal } from 'solid-js';
import { generateUUID } from 'three/src/math/MathUtils';

import styles from './lobby.module.css';
import world from '../assets/world.gif';
import bolt from '../assets/bolt.gif';
import star from '../assets/star.gif';
import tv from '../assets/tv.gif';

/*
 * TODO: This component should show at the top 2 buttons one to create a game the other to join a game either via code 
 * or you can join directly via link
 * In the bottom should be a list of games where people can freely join
 */


const Lobby: Component = () => {
    const navigate = useNavigate();
    const [hoverNav, setHoverNav] = createSignal(false);

   function createGame(): void{
        const gameId = generateUUID();
        navigate(`/game/${gameId}`)
    }

    onMount(() => {
        fetch("http://localhost:5000/session", {credentials: "include"})
    })

    function joinGame(): void{
        return
    }

    function toggleNav(): void{
        setHoverNav(!hoverNav())
    }

    return (
    <>
        <div class="container" id={styles.content}>
            <div class={styles.navigate}>
                <img src={world} onClick={toggleNav} />

                <A href="/lobby" class={styles.link} style={{"left": hoverNav() ? "130px" : "0",
                                                                "transform": hoverNav() ? "scale(1)" : "scale(0.01)"}}>
                    <img src={bolt} id={styles.lobby}/>
                </A>
                <A href="/lobby" class={styles.link} style={{"top": hoverNav() ? "65px" : "0",
                                                                "left": hoverNav() ? "75px" : "0",
                                                                "transform": hoverNav() ? "scale(1)" : "scale(0.01)"}}>
                    <img src={star} id={styles.refresh}/>
                </A>
                 <A href="/lobby" class={styles.link} style={{"top": hoverNav() ? "125px" : "0",
                                                                "transform": hoverNav() ? "scale(1)" : "scale(0.01)"}}>
                    <img src={tv} id={styles.left}/>
                </A>
            </div>
            <div class={styles.buttonContainer}>
                <button class={`${styles.gameButton} ${styles.createButton}`} onClick={createGame}>create</button>
                <button class={`${styles.gameButton} ${styles.joinButton}`} onclick={joinGame}>join</button>
            </div>
        </div>
    </>
    )
}

export default Lobby;
