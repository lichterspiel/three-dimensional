import { A } from '@solidjs/router';
import { Component, createSignal} from "solid-js"

import styles from './corner-nav.module.css'
import world from '../assets/world.gif';
import bolt from '../assets/bolt.gif';
import star from '../assets/star.gif';
import tv from '../assets/tv.gif';


const CornerNav: Component = () => {
    const [hoverNav, setHoverNav] = createSignal(false);


    function toggleNav(): void {
        setHoverNav(!hoverNav())
    }

    function showDescription(e: MouseEvent & { target: HTMLImageElement} ): void {
        const target = e.target;
        const content = document.createElement("div");
        content.innerText = target.getAttribute("data-name") ?? "null";
        content.style.color = "white";
        target.after(content)
    }

    function closeDescription(e: MouseEvent & { target: HTMLImageElement} ): void {
        const target = e.target;
        target.nextSibling?.remove();

    }

    return (
        <div class={styles.navigate}>
            <img src={world} onClick={toggleNav} />

            <A href="/lobby" class={styles.link} style={{"left": hoverNav() ? "130px" : "0",
                                                        "transform": hoverNav() ? "scale(1)" : "scale(0.01)"}}>
                <img  data-name="lobby" src={bolt} id={styles.lobby} onMouseOver={showDescription} onMouseLeave={closeDescription}/>
            </A>
            <A href="/home" class={styles.link} style={{"top": hoverNav() ? "65px" : "0",
                                                        "left": hoverNav() ? "75px" : "0",
                                                                "transform": hoverNav() ? "scale(1)" : "scale(0.01)"}}>
                <img src={star} id={styles.refresh} data-name="home" onMouseOver={showDescription} onMouseLeave={closeDescription}/>
            </A>
            <A href="/lobby" class={styles.link} style={{"top": hoverNav() ? "125px" : "0",
                                                        "transform": hoverNav() ? "scale(1)" : "scale(0.01)"}}>
                <img src={tv} id={styles.left} data-name="left" onMouseOver={showDescription} onMouseLeave={closeDescription}/>
            </A>
        </div>
    )
}

export default CornerNav;
