class Lobby:

    p1 = None
    p2 = None
    isGameRunning = False
    members = 0

    def __init__(self, p1):
        self.p1 = p1
        self.isGameRunning = False
        self.members = 1

    def join_player(self, p):
        if p == self.p1 or self.p2 is not None or self.members != 1:
            return False

        self.p2 = p
        self.members = 2
        self.isGameRunning = True

        return True

    def check_player_in_lobby(self, p):
        if p == self.p1 or p == self.p2:
            return True
        else:
            return False
