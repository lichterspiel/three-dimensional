class Lobby:

    p1 = None
    p2 = None
    game_id = None
    is_game_running = False
    is_game_over = False
    is_private = False
    members = 0
    winner = None

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
        self.is_game_running = True

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
        if ((p == self.p1 or p == self.p2) and
                not self.is_game_over and
                self.is_game_running):
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

    def convert_to_obj(self):
        return {
                'p1': self.p1,
                'isGameRunning': self.is_game_running,
                'members': self.members,
                'gameID': self.game_id,
                }
