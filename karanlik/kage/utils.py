from functools import wraps
import uuid
from flask import session

from .lobby import Lobby
from .game_board import GameBoard


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
        games.append(GameBoard(i, i * 5))

    return games

def add_user_id(fun):
    @wraps(fun)
    def decorated_fun():
        if 'user_id' not in session:
            session['user_id'] = str(uuid.uuid4())

        fun()
    
    return decorated_fun
        
