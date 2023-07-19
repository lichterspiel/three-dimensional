from flask import session, jsonify
from flask_wtf.csrf import generate_csrf
import uuid

from . import main
from .config import lobbies, players
from .. import utils
from ..lobby import Lobby


@utils.add_user_id
@main.route("/api/session")
def handle_session():
    print(session)
    return "", 204


@main.route("/api/lobbies")
def get_lobbies():
    show_list = []
    for lobby in lobbies.values():
        if (
            not lobbies.is_private
            and not lobbies.is_game_over
            and not lobbies.is_game_running
        ):
            show_list.append(lobby.convert_to_obj())

    return jsonify(show_list), 200


@main.route("/apiT/lobbies")
def get_lobbies_test():
    print(jsonify(utils.generate_dummy_lobby()))
    return jsonify(utils.generate_dummy_lobby()), 200


@main.route("/api/getcsrf", methods=["GET"])
def get_csrf():
    token = generate_csrf()
    response = jsonify({"detail": "CSRF cookie set"})
    response.headers.set("X-CSRFToken", token)
    if "user_id" not in session:
        session["user_id"] = str(uuid.uuid4())

    print("===HTTP===")
    print(session)
    print("===HTTP===")

    return response, 200


# TODO: check here if player already in a game and delete that one if its game over else reconect or forfeit
@main.route("/api/createGame")
@utils.add_user_id
def create_game():

    game_id = str(uuid.uuid4())
    playerOldGame = players.get(session["user_id"])
    if playerOldGame:
        if not lobbies[playerOldGame].is_game_over:
            return {"gameID": playerOldGame}
            # surrender old round and make new

    if game_id not in lobbies:
        lobbies[game_id] = Lobby(session["user_id"])
        lobby = lobbies[game_id]
        lobby.game_id = game_id
        players[session["user_id"]] = game_id
    else:
        return "", 400

    return {"gameID": game_id}, 200


@main.route("/api/joinGame/<game_id>")
@utils.add_user_id
def join_game(game_id):
    lobby = lobbies.get(game_id)
    if not lobby:
        return {"canJoin": False}, 200

    if game_id in lobbies:
        if lobby.check_player_can_join(session["user_id"]):
            players[session["user_id"]] = game_id
            return {"canJoin": True}, 200
    else:
        return {"canJoin": False}, 200


@main.route("/api/runningGame")
@utils.add_user_id
def running_game():

    print(lobbies)
    for lobby in lobbies.values():
        if lobby.player_is_in_lobby(session["user_id"]):
            return {"runningGame": True, "lobby": lobby.convert_to_obj()}, 200

    return {"runningGame": False}, 200
