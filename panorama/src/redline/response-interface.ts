interface InitGame{
    [key: string]: number | string | number[][]
    board: number[][];
    turn: number;
    count: number;
}

interface ConfirmPlayerMove{
    field: number
}
