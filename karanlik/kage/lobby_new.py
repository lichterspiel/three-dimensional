from kage.game import Game
from kage.player import Player


class Lobby:
    id = None
    p1: Player = None
    p2: Player = None
    members = 0
    winner = None
    game = None
    is_game_running = False
    is_game_over = False
    is_private = False
    p1_ready = False
    p2_ready = False

    def __init__(self, p1, is_private=True):
        self.p1 = p1
        self.is_game_running = False
        self.is_game_over = False
        self.is_private = is_private
        self.members = 1

    def join_player(self, p, p_name):
        if p == self.p1 or self.p2 is not None or self.members != 1:
            return False

        self.p2 = p
        self.members = 2
        return True

    def player_toggle_ready(self, p):
        if (p == self.p1):
            self.p1.toggle_ready()
        elif (p == self.p2):
            self.p2.toggle_ready()

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
        self.p1_ready = False
        self.p2_ready = False

    def get_other_player(self, p):
        return self.p1 if p == self.p2 else self.p2

    def set_winner(self, p):
        self.winner = self.p1 if p == self.p1 else self.p2

    def start_new_game(self, mode):
        if not self.p1_ready and not self.p2_ready:
            return
        self.game = Game(self.p1, self.p2, mode)
        self.is_game_running = True
        self.is_game_over = False
        self.winner = ""

    def player_leave(self, p):
        if p == self.p1:
            if self.p2:
                self.p1 = self.p2
                self.p1_name = self.p2_name
                self.p2 = None
                self.p2_name = None
            else:
                self.p1 = None
                self.p1_name = None

            self.members -= 1
            if self.is_game_running:
                self.set_winner(self.p1)
                self.game_over()
                return True

        if p == self.p2:
            self.p2 = None
            self.p2_name = None
            self.p1_ready = False
            self.p2_ready = False
            self.members -= 1
            if self.is_game_running:
                self.set_winner(self.p1)
                self.game_over()
                return True

        return False
    
    # later when the frontend navigates them away and the disconnect is called
    # the function above will handle the logic
    def handle_kick_player(self, p):
        if self.is_game_running:
            return False
        if p == self.p2:
            return True
    
    def handle_change_private(self):
        self.is_private = not self.is_private
        return self.is_private

    def convert_to_obj(self):
        return {
            "p1": {"id": self.p1, "name": self.p1_name, "ready": self.p1_ready, "admin": True, "color": self.p1_color},
            "p2": {"id": self.p2, "name": self.p2_name, "ready": self.p2_ready, "admin": False, "color": self.p2_color} if self.p2 else None, 
            "isGameRunning": self.is_game_running,
            "members": self.members,
            "gameID": self.id,
        }
