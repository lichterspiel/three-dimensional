interface InitGame{
    [key: string]: number | string | number[][]
    board: number[][];
    turn: number;
    count: number;
}

interface LoadGame {
    [key: string]: number | string | number[][]
    board: number[][]
    turn: number
    p1: string 
    p2: string 
}



interface ConfirmPlayerMove{
    field: number
}
