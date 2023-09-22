import { GameMode } from "../game-modes"

export interface GameResponse {
	board: number[][] | number[],
	turn: string,
	p1: string,
	p2: string,
	mode: GameMode,
}