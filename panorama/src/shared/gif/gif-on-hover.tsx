import { Component, createSignal } from "solid-js";

const GifOnHover: Component<{
    moving: string;
    frozen: string;
    onClick?: Function;
    onMouseOver?: Function;
    onMouseLeave?: Function;
}> = (props) => {
    const moving = new URL(props.moving, import.meta.url).href;
    const frozen = new URL(props.frozen, import.meta.url).href;
    const [img, setImg] = createSignal(frozen);

    function handleMouseHoverPlay(): void {
        if (props.onMouseOver) {
            props.onMouseOver();
        }

        setImg(moving);
    }

    function handeMouseLeaveStop(): void {
        if (props.onMouseLeave) {
            props.onMouseLeave();
        }

        setImg(frozen);
    }

    function handleOnClick(): void {
        if (props.onClick) {
            props.onClick();
        }
    }

    return (
        <>
            <img
                src={`${img()}`}
                onMouseEnter={handleMouseHoverPlay}
                onMouseLeave={handeMouseLeaveStop}
                onClick={handleOnClick}
            />
        </>
    );
};

export default GifOnHover;
