import uuid

from flask import jsonify, session, request
from flask_wtf.csrf import generate_csrf

from .. import utils
from ..lobby import Lobby
from . import main
from .config import lobbies, players


@main.route("/api/lobbies")
def get_lobbies():
    show_list = []
    for lobby in lobbies.values():
        print(lobby)
        if (
            not lobby.is_private
            and not lobby.is_game_running
        ):
            show_list.append(lobby.convert_to_obj())

    return jsonify(show_list), 200


@main.route("/api/getcsrf", methods=["GET"])
def get_csrf():
    token = generate_csrf()
    response = jsonify({"detail": "CSRF cookie set"})
    response.headers.set("X-CSRFToken", token)
    if "user_id" not in session:
        session["user_id"] = str(uuid.uuid4())

    return response, 200


@main.route("/api/user", methods=["POST", "GET"])
@utils.add_user_id
def handle_user_settings():
    if request.method == "POST":
        data = request.get_json()
        session["color"] = data["color"]
        session["name"] = data["name"]
        return {"success": True}
    else:
        return {"name": session["name"], "color": session["color"]}, 200


"""
This inizializes the lobby and joins the creator into the lobby
for now this reconects to the old game if it is still running so the player needs to surrender 
"""


@main.route("/api/createLobby")
@utils.add_user_id
def create_lobby():
    game_id = str(uuid.uuid4())
    if game_id not in lobbies:
        lobbies[game_id] = Lobby(session["user_id"], session["name"], session["color"])
        lobbies[game_id].id = game_id
        players[session["user_id"]] = game_id
    else:
        return "", 400

    return {"gameID": game_id}, 200


"""
This is to 1. give the joining user an id and 2. check if he should be able to connect
The reason i need this is because if i only do it in websockets the user id will not be 
added to the session before there was an http request
"""


@main.route("/api/joinLobby/<game_id>")
@utils.add_user_id
def check_player_can_join_lobby(game_id):
    lobby = lobbies.get(game_id)
    if not lobby:
        return {"canJoin": False}, 200
    if game_id in lobbies:
        if lobby.check_player_can_join(session["user_id"]):
            players[session["user_id"]] = game_id
            return {
                "canJoin": True,
                "gameRunning": lobby.is_game_running,
                "userID": session["user_id"],
            }, 200
    else:
        return {"canJoin": False}, 200
