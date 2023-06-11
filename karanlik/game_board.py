import math
import json


class GameBoard:

    magicSquare = [
                [8, 1, 6],
                [3, 5, 7],
                [4, 9, 2],
              ]

    empty_cell = ""

    def __init__(self, ply1, ply2):
        self.p1 = ply1
        self.p2 = ply2
        self.board = [[self.empty_cell for i in range(3)]for i in range(3)]
        self.turn = self.p1

    def make_move(self, player, move):
        print(self.board, self.turn, player)
        if (self.turn != player or
                self.board[math.floor(move / 3)][move % 3] != self.empty_cell):
            return False

        self.board[math.floor(move / 3)][move % 3] = player

        self.turn = self.p1 if self.turn == self.p2 else self.p2
        return True

# TODO: definetly rework this haha
    def check_if_won(self, lastMove):

        count = 0
        # check row of last move
        rowCheck = self.board[math.floor(lastMove / 3)]
        for i, value in enumerate(rowCheck):
            if self.turn == value:
                count += self.magicSquare[math.floor(lastMove / 3)][i]
        if count == 15:
            return True

        count = 0
        # check column of last move
        for i, row in enumerate(self.board):
            if row[lastMove % 3] == self.turn:
                count += self.magicSquare[i][lastMove % 3]
        if count == 15:
            return True

        count = 0
        # diagonal check
        for i, row in enumerate(self.board):
            if row[i] == self.turn:
                count += self.magicSquare[i][i]
        if count == 15:
            return True

        count = 0
        # anti diagonal check
        for i, row in enumerate(self.board):
            if row[len(row) - 1 - i] == self.turn:
                count += self.magicSquare[i][len(row) - 1 - i]
        if count == 15:
            return True

        return False

    def convert_to_obj(self):
        return json.dumps({
            "board": self.board,
            "turn": self.turn,
            "p1": self.p1,
            "p2": self.p2,
        })
