from flask import session, request
from flask_socketio import emit, join_room 
import json

from .. import socketio
from ..game_board import GameBoard

from .config import lobbies, players


@socketio.on("connect")
def on_connect(rq):
    print("===SOCKET===")
    print(session)
    print("===SOCKET===")

    emit("send-id", session.get("user_id"), to=request.sid)


@socketio.on("lobby-join")
def handle_lobby_join():
    game_id = players[session["user_id"]]
    lobby = lobbies[game_id]

    join_room(game_id)
    if lobby.join_player(session["user_id"]):
        emit("lobby-joined", lobby.convert_to_obj(), to=game_id)
    elif lobby.p1 == session["user_id"]:
        emit("lobby-joined", lobby.convert_to_obj(), to=game_id)


@socketio.on("game-join")
def handle_game_join():
    game_id = players[session["user_id"]]
    lobby = lobbies[game_id]

    if lobby.check_player_in_running_game(session["user_id"]):
        game = lobby.game
        emit("load-game", game.convert_to_obj(), to=request.sid)
    elif lobby.is_game_over:
        emit("game-over", json.dumps({"winner": lobby.winner}), to=request.sid)


@socketio.on("start-game")
def handle_start_game():
    game_id = players[session["user_id"]]
    lobby = lobbies[game_id]
    if (lobby.members == 2):
        lobby.start_new_game()
        emit("game-started", to=game_id)


@socketio.on("player-move")
def handle_player_move(rq):
    game_id = players[session["user_id"]]
    lobby = lobbies[game_id]
    game = lobby.game

    player_id = session["user_id"]
    move = rq["field"]

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
        lobby.set_winner(session["user_id"])
        emit("game-over", json.dumps({"winner": lobby.winner}), to=game_id)

        del game

    elif game.check_if_tie():
        lobby.game_over()
        emit("tie", to=game_id)

        if game:
            del game


@socketio.on("player-surrender")
def handle_player_surrender():
    game_id = players[session["user_id"]]
    lobby = lobbies[game_id]
    game = lobby.game
    player_id = session["user_id"]

    lobby.game_over()

    players[session["user_id"]] = ""
    lobby.set_winner(lobby.get_other_player(player_id))

    emit(
        "confirm-surrender",
        json.dumps({"winner": lobby.get_other_player(player_id)}),
        to=game_id,
    )

    del game