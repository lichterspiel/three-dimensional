import {ComponentProps} from 'solid-js';
import Modal from './modal';
import styles from './game-over-modal.module.css';
import Backdrop from '../backdrop/backdrop';


interface GameOverModalProps extends ComponentProps<'div'> {
   onPlayAgain?: () => void;
   onNewGame?: () => void;
   message?: string;
}


const GameOverModal = ({onPlayAgain, onNewGame, message}: GameOverModalProps) => {
   return (
   <>
       <Modal>
           <div class={styles.GameOverModal}>
           <h1 class={styles.message}> {message}</h1>
               <div class={styles.actionPanel}>
                   <button class={styles.actionBtn} onclick={onPlayAgain}>
                      Home 
                   </button>
                   <button class={styles.actionBtn} onclick={onNewGame}>
                       Revenge 
                   </button>
               </div>
           </div>
       </Modal>
       <Backdrop/>
    </>
   );
};


export default GameOverModal;

