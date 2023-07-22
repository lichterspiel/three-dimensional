import { Component, JSX, onCleanup, Show } from 'solid-js';
import { Portal } from 'solid-js/web';

import styles from './modal.module.css';

interface ModalProps {
    children: JSX.Element;
    cancelText?: string;
    confirmText?: string;
    isOpen: boolean;
    setIsOpen: Function;
    fun1?: Function;
    fun2?: Function;

}


const Modal: Component<ModalProps> = (props) => {
    onCleanup(() => closeModal());

    function closeModal() {
        props.setIsOpen(false);
    }

    return (
        <Show when={props.isOpen}>
            <Portal mount={document.body}>
                <div class={styles.backdrop}></div>
                <div class={styles.modal}>
                    <div class={styles.modalHeader}>
                        <button onClick={closeModal} class={styles.headerClose}></button>
                    </div>

                    <div class={styles.modalContent}>
                        {props.children}
                    </div>

                    <div class={styles.actionPanel}>
                        <button class={styles.actionBtn} onclick={() => props.fun1 ? props.fun1() : closeModal()}>
                            {props.cancelText ?? "Close"}
                        </button>
                        <button class={styles.actionBtn} onclick={() => props.fun2 ? props.fun2() : closeModal()}>
                            {props.confirmText ?? "Confirm"}
                        </button>

                    </div>
                </div>
            </Portal>
        </Show>
    )
};

export default Modal;
