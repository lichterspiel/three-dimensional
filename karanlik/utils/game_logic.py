import math

magicSquare = [
                [8, 1, 6],
                [3, 5, 7],
                [4, 9, 2],
              ]


# TODO: definetly rework this haha
def check_if_won(board, lastMove, turn):

    count = 0
    # check row of last move
    rowCheck = board[math.floor(lastMove / 3)]
    for i, value in enumerate(rowCheck):
        if turn == value:
            count += magicSquare[math.floor(lastMove / 3)][i]
    if count == 15:
        return True

    count = 0
    # check column of last move
    for i, row in enumerate(board):
        if row[lastMove % 3] == turn:
            count += magicSquare[i][lastMove % 3]
    if count == 15:
        return True

    count = 0
    # diagonal check
    for i, row in enumerate(board):
        if row[i] == turn:
            count += magicSquare[i][i]
    if count == 15:
        return True

    count = 0
    # anti diagonal check
    for i, row in enumerate(board):
        if row[len(row) - 1 - i] == turn:
            count += magicSquare[i][len(row) - 1 - i]
    if count == 15:
        return True

    return False
