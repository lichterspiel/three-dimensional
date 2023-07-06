import {Component, JSX, Show, createSignal, onCleanup, onMount} from 'solid-js';
import {Portal} from 'solid-js/web';

interface ModalProps {
    children: JSX.Element;
}


const Modal: Component<ModalProps> = (props) => {
    const [isOpen, setIsOpen] = createSignal(false);
    // Open the modal when the component is mounted
    onMount( () => setIsOpen(true));
    onCleanup( () => setIsOpen(false));
    return (
        <Show when={isOpen()}>
            <Portal mount={document.getElementById('modal') as Node}>
                {props.children}
            </Portal>
        </Show>
   )
};


export default Modal;

