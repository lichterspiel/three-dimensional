export interface PlsInit{
    playerId: string;
    gameId: string;
}

export interface PlayerMove{
    gameId: string;
    playerNum: number;
    field: number;
}
