import os
import uuid
import random
import string
from functools import wraps

from flask import session

from .game import Game
from .lobby import Lobby


def generate_dummy_lobby(count=20):
    lobbies = []
    for i in range(count):
        lobby = Lobby(i)
        lobby.game_id = i
        lobbies.append(lobby.convert_to_obj())

    return lobbies


def generate_dummy_game(count=20):
    games = []
    for i in range(count):
        games.append(Game(i, i * 5))

    return games


def add_user_id(fun):
    @wraps(fun)
    def decorated_fun(*args, **kwargs):
        if session.get("user_id") is None:
            session["user_id"] = str(uuid.uuid4())
            # session["name"] = 0xb00b00
            session["name"] = "Akira-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
            session["color"] = "#{:06x}".format(random.randint(0, 0xFFFFFF))

        return fun(*args, **kwargs)

    return decorated_fun


def check_user_id():
    if session.get("user_id") is None:
        session["user_id"] = str(uuid.uuid4())
