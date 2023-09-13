import json
import math


class GameBoard:
    EMPTY_CELL = ""
    UP_RIGHT = 0
    UP_LEFT = 1
    UP_UP = 2
    UP_DOWN = 3
    CROSS_LEFT_RIGHT = 4
    CROSS_UP_DOWN = 5

    solve_moves_3D = {
        0: {
            0: [UP_RIGHT, UP_DOWN],
            2: [UP_LEFT, UP_DOWN],
            6: [UP_RIGHT, UP_UP],
            8: [UP_LEFT, UP_UP],
        },
        1: {
            1: [UP_RIGHT, UP_LEFT],
            3: [UP_UP, UP_DOWN],
            5: [UP_UP, UP_DOWN],
            7: [UP_RIGHT, UP_LEFT],
        },
        2: {
            0: [UP_LEFT, UP_UP],
            2: [UP_RIGHT, UP_UP],
            6: [UP_LEFT, UP_DOWN],
            8: [UP_RIGHT, UP_DOWN],
        }
    }

    def __init__(self, ply1, ply2, mode=0):
        self.p1 = ply1
        self.p2 = ply2
        self.board = [[[self.EMPTY_CELL for i in range(
            3)] for i in range(3)] for i in range(3)]
        self.turn = self.p1
        self.solve_fun = [self.check_up_right,
                          self.check_up_left,
                          self.check_up_up,
                          self.check_up_down]
        self.mode = mode

    def make_move(self, player, move):
        b_num, x, y = self.convertString2Move(move)
        b = self.board[b_num]

        if self.turn != player or not b[y][x] == self.EMPTY_CELL:
            return False

        b[y][x] = player
        self.turn = self.p1 if self.turn == self.p2 else self.p2
        return True

    def check_win(self, lastMove, player):
        if self.mode == 0:
            return (self.check_win_2D(lastMove, player) or
                    self.check_win_3D(lastMove, player))

    def check_win_3D(self, lastMove, player):
        b, x, y = self.convertString2Move(lastMove)
        # Straight line top to bottom (column)
        if self.check_vertical_3D(b, x, y, player):
            return True

        moves_to_check = self.solve_moves_3D[b].get(int(lastMove[1]))
        if not moves_to_check:
            return False

        for m in moves_to_check:
            if self.solve_fun[m](x, y, player):
                return True

        return False

    # bottom board left field to up right field
    def check_up_right(self, x, y, player):
        count = 0
        for i in range(3):
            if self.board[i][y][i] == player:
                count += 1
        return count == 3

    # bottom board right fiedl to up left field
    def check_up_left(self, x, y, player):
        count = 0
        for i in range(3):
            if self.board[i][y][2 - i] == player:
                count += 1
        return count == 3

    # bottom board last row field to first row field top board
    def check_up_up(self, x, y, player):
        print("HERE")
        print(x, y)
        print("HERE")
        count = 0
        for i in range(3):
            if self.board[i][2 - i][x] == player:
                print("COUNT")
                count += 1
        print(f"COUNT: {count}")
        return count == 3

    # bottom board first row field to last row field top board
    def check_up_down(self, x, y, player):
        count = 0
        for i in range(3):
            if self.board[i][i][x] == player:
                count += 1
        return count == 3

    def check_vertical_3D(self, b, x, y, player):
        count = 0
        for i in range(3):
            if self.board[i][y][x] == player:
                count += 1
        return count == 3

    def check_win_2D(self, lastMove, player):
        b, x, y = self.convertString2Move(lastMove)
        board = self.board[b]

        count = 0
        # check row of last move
        rowCheck = board[y]
        for i, value in enumerate(rowCheck):
            if value == player:
                count += 1
        if count == 3:
            return True

        count = 0
        # check column of last move
        for i, row in enumerate(board):
            if row[x] == player:
                count += 1
        if count == 3:
            return True

        count = 0
        # diagonal check
        for i, row in enumerate(board):
            if row[i] == player:
                count += 1
        if count == 3:
            return True

        count = 0
        # anti diagonal check
        for i, row in enumerate(board):
            if row[len(row) - 1 - i] == player:
                count += 1
        if count == 3:
            return True

        return False

    def check_tie(self):
        if self.mode == 0:
            self.check_tie_3D()
        else:
            self.check_tie_2D(self.board)

    # TODO: implement this
    def check_tie_3D(self):
        return False

    def check_tie_2D(self, board):
        for row in board:
            for column in row:
                if column == "":
                    return False
        return True

    def convertString2Move(self, move):
        print("MOVEEEEE:"+ move)
        b = int(move[0])
        y = math.floor(int(move[1]) / 3)
        x = math.floor(int(move[1]) % 3)
        return b, x, y

    def convert_to_obj(self):
        return json.dumps(
            {
                "board": self.board,
                "turn": self.turn,
                "p1": self.p1,
                "p2": self.p2,
            }
        )

    def check_cross_left_right(self, b, x, y, player):
        count_l = 3
        count_r = 3
        for i in range(3):
            if self.board[b + i - 1][y][x + i - 1] == player:
                count_l += 1
            if self.board[b + i - 1][y][x - i + 1] == player:
                count_r += 1
        return count_l == 3 or count_r == 3

    def check_cross_up_down(self, b, x, y, player):
        count_u = 3
        count_d = 3
        for i in range(3):
            if self.board[b + i - 1][y + i - 1][x] == player:
                count_u += 1
            if self.board[b + i - 1][y - i + 1][x] == player:
                count_d += 1
        return count_u == 3 or count_d == 3
