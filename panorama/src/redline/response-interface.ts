import { GameMode } from "../shared/game-modes";

export interface InitGame {
  board: string[][];
  turn: string;
  count: number;
}

export interface LoadGame {
  board: string[][];
  turn: string;
  p1: string;
  p2: string;
  mode: GameMode;
}

export interface ConfirmPlayerMove {
  field: number;
  turn: string;
}

export interface GameLobby {
  p1: string;
  isGameRunning: boolean;
  members: number;
  gameID: string;
}
