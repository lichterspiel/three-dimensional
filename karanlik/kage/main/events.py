import json

from flask import request, session
from flask_socketio import emit, join_room, leave_room

from .. import socketio
from .config import lobbies, players


@socketio.on("connect")
def on_connect(rq):
    emit("send-id", session.get("user_id"), to=request.sid)


@socketio.on("disconnect")
def on_disconnect():
    game_id = players[session["user_id"]]
    lobby = lobbies[game_id]
    leave_room(session["user_id"])
    players[session["user_id"]] = ""
    if lobby.player_leave(session["user_id"]):
        emit(
            "confirm-surrender",
            ({"winner": lobby.winner}),
            to=game_id,
        )
        players[session["user_id"]] = ""
    if lobby.members != 0:
        emit("lobby-leave", lobby.convert_to_obj(), to=game_id)
    elif lobby.members == 0:
        del lobby
        lobbies.pop(game_id)
    print(lobbies)


"""
This joins the player into a lobby to keep track on how many users are in a room
"""


@socketio.on("lobby-join")
def handle_lobby_join():
    game_id = players[session["user_id"]]
    lobby = lobbies[game_id]

    join_room(game_id)
    if lobby.join_player(session["user_id"]):
        emit("lobby-joined", lobby.convert_to_obj(), to=game_id)
    elif lobby.p1 == session["user_id"]:
        emit("lobby-joined", lobby.convert_to_obj(), to=game_id)
    else:
        leave_room(game_id)

@socketio.on("kick-player")
def handle_kick_player(rq):
    game_id = players[session["user_id"]]
    lobby = lobbies[game_id]
    if lobby.p1 != session["user_id"]:
        return
    if lobby.kick_player(rq["player"]):
        emit("player-kicked", {"player":rq["player"]})

@socketio.on("toggle-ready")
def handle_toggle_ready():
    game_id = players[session["user_id"]]
    lobby = lobbies[game_id]
    lobby.player_toggle_ready(session["user_id"])
    emit("toggled-ready", lobby.convert_to_obj(), to=game_id)


@socketio.on("change-mode")
def handle_change_mode(rq):
    game_id = players[session["user_id"]]
    lobby = lobbies[game_id]
    if (lobby.p1 == session["user_id"]):
        emit("mode-changed", {"mode": rq["mode"]}, to=game_id)

@socketio.on("toggle-private")
def handle_toggle_private():
    game_id = players[session["user_id"]]
    lobby = lobbies[game_id]
    if (lobby.p1 == session["user_id"]):
        emit("toggled-private", {"isPrivate": lobby.is_private}, to=game_id)




"""
This is used to initialize the game and start showing the game on the frontend
"""


@socketio.on("start-game")
def handle_start_game(rq):
    game_id = players[session["user_id"]]
    lobby = lobbies[game_id]
    if lobby.members == 2 and not lobby.is_game_running:
        lobby.start_new_game(rq["mode"])
        emit("game-started", to=game_id)
        emit("refresh-lobby", lobby.convert_to_obj(), to=game_id)


@socketio.on("game-join")
def handle_game_join():
    game_id = players[session["user_id"]]
    lobby = lobbies[game_id]
    game = lobby.game
    emit("load-game", game.convert_to_obj(), to=request.sid)

    """
    This is here to later persist the game when refreshing
    if lobby.check_player_in_running_game(session["user_id"]):
        game = lobby.game
        emit("load-game", game.convert_to_obj(), to=request.sid)
    elif lobby.is_game_over:
        emit("game-over",  ({"winner": lobby.winner}), to=request.sid)
    """


@socketio.on("player-move")
def handle_player_move(rq):
    game_id = players[session["user_id"]]
    lobby = lobbies[game_id]
    game = lobby.game

    player_id = session["user_id"]
    move = rq["field"]

    if lobby.is_game_over:
        return

    if game.player_move(player_id, move):
        emit(
            "confirm-player-move",
            ({"field": move, "turn": game.turn}),
            to=game_id,
        )

    if game.check_win(move, player_id):
        lobby.game_over()
        lobby.set_winner(session["user_id"])
        emit("game-over", ({"winner": lobby.winner}), to=game_id)

        del game

    elif game.check_tie():
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

    lobby.set_winner(lobby.get_other_player(player_id))

    emit(
        "confirm-surrender",
        ({"winner": lobby.get_other_player(player_id)}),
        to=game_id,
    )
    del game
