from kage.game_board import GameBoard


class Lobby:
    id = None
    p1 = None
    p2 = None
    members = 0
    winner = None
    game = None
    is_game_running = False
    is_game_over = False
    is_private = False

    def __init__(self, p1, is_private=False):
        self.p1 = p1
        self.is_game_running = False
        self.is_game_over = False
        self.is_private = is_private
        self.members = 1

    def join_player(self, p):
        if p == self.p1 or self.p2 is not None or self.members != 1:
            return False

        self.p2 = p
        self.members = 2
        return True

    def check_player_in_running_game(self, p):
        if (p == self.p1 or p == self.p2) and self.is_game_running:
            return True
        else:
            return False

    def check_player_can_join(self, p):
        if (p == self.p1 or p == self.p2) or (p != self.p1 and self.members == 1):
            return True
        else:
            return False

    def player_is_in_lobby(self, p):
        if (
            (p == self.p1 or p == self.p2)
            and not self.is_game_over
            and self.is_game_running
        ):
            return True
        else:
            return False

    def check_players_joined(self):
        if self.p1 and self.p2:
            return True
        else:
            return False

    def game_over(self):
        self.is_game_running = False
        self.is_game_over = True

    def get_other_player(self, p):
        return self.p1 if p == self.p2 else self.p2

    def set_winner(self, p):
        self.winner = self.p1 if p == self.p1 else self.p2

    def start_new_game(self):
        self.game = GameBoard(self.p1, self.p2)
        self.is_game_running = True
        self.is_game_over = False
        self.winner = ""

    def player_leave(self, p):
        if p == self.p1:
            if self.p2:
                self.p1 = self.p2
            else:
                self.p1 = None

            self.p2 = None
            self.members -= 1
            if self.is_game_running:
                self.set_winner(self.p1)
                self.game_over()
                return True

        if p == self.p2:
            self.p2 = None
            self.members -= 1
            if self.is_game_running:
                self.set_winner(self.p1)
                self.game_over()
                return True

        return False

    def convert_to_obj(self):
        return {
            "p1": self.p1,
            "p2": self.p2 if self.p2 else "",
            "isGameRunning": self.is_game_running,
            "members": self.members,
            "gameID": self.id,
        }
