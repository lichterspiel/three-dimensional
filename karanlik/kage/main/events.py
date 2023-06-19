from flask import session, request
from flask_socketio import emit, join_room, leave_room
import json

from .. import socketio
from ..game_board import GameBoard

from .config import lobbies, games, players


@socketio.on("connect")
def on_connect(rq):
    print("===SOCKET===")
    print(session)
    print("===SOCKET===")

    emit("send-id", session.get("user_id"), to=request.sid)


@socketio.on("player-join")
def handle_player_join(rq):
    game_id = rq["gameID"]
    lobby = lobbies[game_id]

    join_room(game_id)
    emit("send-id", session.get("user_id"), to=request.sid)

    if lobby.join_player(session["user_id"]):
        initGame(game_id, lobby.p1, lobby.p2)
    elif lobby.check_player_in_running_game(session["user_id"]):
        game = games[game_id]
        emit("load-game", game.convert_to_obj(), to=request.sid)


@socketio.on("player-move")
def handle_player_move(res):
    game_id = res["gameID"]
    game = games[game_id]
    lobby = lobbies[game_id]

    player_id = session["user_id"]
    move = res["field"]

    if lobby.is_game_over:
        return

    if game.make_move(player_id, move):
        emit(
            "confirm-player-move",
            json.dumps({"field": move, "turn": game.turn}),
            to=game_id,
        )

    if game.check_if_won(move, player_id):
        lobby.game_over()

        print("WOOOOOOOOONNNNNNNNNNNNN")
        players[session["user_id"]] = ""
        emit("game-over", json.dumps({"winner": player_id}), to=game_id)

        del game
        leave_room(game_id)
    elif game.check_if_tie():
        lobbies[game_id].game_over()

        emit("tie", to=game_id)

        if game:
            del game
        leave_room(game_id)


@socketio.on("player-surrender")
def handle_player_surrender(res):
    game_id = res["gameID"]
    game = games[game_id]
    lobby = lobbies[game_id]
    player_id = session["user_id"]

    lobby.game_over()

    players[session["user_id"]] = ""

    emit(
        "confirm-surrender",
        json.dumps({"winner": lobby.get_other_player(player_id)}),
        to=game_id,
    )

    del game
    leave_room(game_id)


def initGame(game_id, p1, p2):
    lobby = lobbies[game_id]

    if game_id not in games:
        # TODO: put later player id from registration
        games[game_id] = GameBoard(p1, p2)
        game = games[game_id]

    lobby.is_game_running = True

    emit("load-game", game.convert_to_obj(), to=game_id)
