interface InitGame{
    board: string[][];
    turn: string;
    count: number;
}

interface LoadGame {
    board: string[][];
    turn: string;
    p1: string;
    p2: string; 
}



interface ConfirmPlayerMove{
    field: number;
    turn: string;
}
