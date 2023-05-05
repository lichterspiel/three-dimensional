import { generateUUID } from 'three/src/math/MathUtils';
import styles from './lobby.module.css';
import { Component } from "solid-js";
import { useNavigate } from '@solidjs/router';
import axios from 'axios';

/*
 * TODO: This component should show at the top 2 buttons one to create a game the other to join a game either via code 
 * or you can join directly via link
 * In the bottom should be a list of games where people can freely join
 */


const Lobby: Component = () => {
    const navigate = useNavigate();

    async function createGame(){
        const gameId = generateUUID();
        await fetch("http://localhost:5000/session", {credentials: "include"})
        console.log(document.cookie);
        
        navigate(`/game/${gameId}`)
    }

    function joinGame(): void{
    }

    return (<>
    <div class="container">
        <div class={styles.buttonContainer}>
          <button class={styles.gameButton} onClick={createGame}>Create</button>
          <button class={styles.gameButton} onclick={joinGame}>Join</button>
        </div>
    </div>
    </>)
}

export default Lobby;
