import { A } from "@solidjs/router";
import { Component, createSignal } from "solid-js";

import bluePlanet from "../assets/blueplanet.gif";
import bolt from "../assets/bolt.gif";
import star from "../assets/star.gif";
import world from "../assets/world.gif";
import worldStatic from "../assets/world.png";
import GifOnHover from "../shared/gif/gif-on-hover";
import styles from "./corner-nav.module.css";

const CornerNav: Component = () => {
  const [navClick, setNavClick] = createSignal(false);

  function toggleNav(): void {
    setNavClick(!navClick());
  }

  function showDescription(e: MouseEvent): void {
    const target = e.target as HTMLImageElement;
    if (!target) return;
    const content = document.createElement("div");
    content.innerText = target.getAttribute("data-name") ?? "null";
    content.style.color = "white";
    content.style.fontWeight = "600";
    content.style.backdropFilter = "blur(10px)";
    content.style.padding = "2px";
    target.after(content);
  }

  function closeDescription(e: MouseEvent): void {
    const target = e.target as HTMLImageElement;
    if (!target) return;

    target.nextSibling?.remove();
  }

  return (
    <div class={styles.navigate}>
      <GifOnHover moving={world} frozen={worldStatic} onClick={toggleNav} />

      <A
        href="/lobby"
        class={styles.link}
        style={{
          left: navClick() ? "130px" : "0",
          transform: navClick() ? "scale(1)" : "scale(0.01)",
        }}
      >
        <img
          data-name="lobby"
          src={bolt}
          id={styles.lobby}
          onclick={toggleNav}
          onMouseOver={showDescription}
          onMouseLeave={closeDescription}
        />
      </A>
      <A
        href="/home"
        class={styles.link}
        style={{
          top: navClick() ? "65px" : "0",
          left: navClick() ? "75px" : "0",
          transform: navClick() ? "scale(1)" : "scale(0.01)",
        }}
      >
        <img
          src={star}
          id={styles.refresh}
          data-name="home"
          onclick={toggleNav}
          onMouseOver={showDescription}
          onMouseLeave={closeDescription}
        />
      </A>
      <A
        href="/about"
        class={styles.link}
        style={{
          top: navClick() ? "125px" : "0",
          transform: navClick() ? "scale(1)" : "scale(0.01)",
        }}
      >
        <img
          src={bluePlanet}
          id={styles.left}
          data-name="about"
          onclick={toggleNav}
          onMouseOver={showDescription}
          onMouseLeave={closeDescription}
        />
      </A>
    </div>
  );
};

export default CornerNav;
