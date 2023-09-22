import { Player } from "../player-interface";

export interface LobbyResponse {
    p1: Player,
    p2: Player,
    members: number,
    gameID: string,
    isGameRunning: boolean,
}
