from flask import Flask, session, request, jsonify
from flask_session import Session
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect, generate_csrf
import uuid
import json

from game_board import GameBoard
from lobby import Lobby
import util


app = Flask(__name__)
app.config.update(
    DEBUG=True,
    SECRET_KEY="secret_sauce",
    SESSION_TYPE="filesystem",
    SESSION_COOKIE_HTTPONLY=True,
    REMEMBER_COOKIE_HTTPONLY=True,
    SESSION_PERMANENT=False,
    SESSION_COOKIE_SAMESITE='Lax',
)

csrf = CSRFProtect(app)
CORS(app,
     resources={r"*": {"origins": "http://localhost:3000"}},
     expose_headers=["Content-Type", "X-CSRFToken"],
     origins=['http://localhost:3000'],
     supports_credentials=True)

Session(app)
socketio = SocketIO(app,
                    cors_allowed_origins="http://localhost:3000",
                    manage_session=False)

# rooms is the game and lobbies is before the game starts the initial phase
# where we wait until 2 players joined
rooms = {}
lobbies = {}


@app.route("/api/session")
def handle_session():
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
        print(session)
    return '', 204


@app.route("/api/lobbies")
def get_lobbies():
    show_list = []
    for lobby in lobbies:
        if (not lobbies.is_private and
            not lobbies.is_game_over and
                not lobbies.is_game_running):
            show_list.append(lobby.convert_to_obj())

    return jsonify(show_list), 200


@app.route("/apiT/lobbies")
def get_lobbies_test():
    print(jsonify(util.generate_dummy_lobby()))
    return jsonify(util.generate_dummy_lobby()), 200


@app.route("/api/getcsrf", methods=["GET"])
def get_csrf():
    token = generate_csrf()
    response = jsonify({"detail": "CSRF cookie set"})
    response.headers.set("X-CSRFToken", token)
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())

    print("===HTTP===")
    print(session)
    print("===HTTP===")

    return response, 200


#TODO: check here if player already in a game and delete that one if its game over else reconect or forfeit
@app.route("/api/createGame")
def create_game(rq):
    game_id = str(uuid.uuid4())

    if game_id not in lobbies:
        lobbies[game_id] = Lobby(session['user_id'])
        lobbies[game_id].game_id = game_id
    else:
        return 400

    return {'gameID': game_id}, 200


@app.route("/api/joinGame/<id>")
def join_game(game_id):
    if game_id in lobbies:
        if lobbies[game_id].check_player_can_join(session['user_id']):
            return {'canJoin': True}, 200
    else:
        return {'canJoin': False}, 400


@socketio.on('connect')
def on_connect(rq):
    print("===SOCKET===")
    print(session)
    print("===SOCKET===")

    emit("send-id", session.get('user_id'), to=request.sid)


@socketio.on('player-join')
def handle_player_join(rq):
    game_id = rq['gameID']

    join_room(game_id)
    emit("send-id", session.get('user_id'), to=request.sid)

    if lobbies[game_id].join_player(session['user_id']):
        initGame(game_id, lobbies[game_id].p1, lobbies[game_id].p2)

    if lobbies[game_id].check_player_in_running_game(session['user_id']):
        emit("load-game", rooms[game_id].convert_to_obj(), to=request.sid)


@socketio.on('player-move')
def handle_player_move(res):
    game_id = res['gameID']
    game = rooms[res['gameID']]
    player_id = session['user_id']
    move = res['field']

    if lobbies[game_id].is_game_over:
        return

    if game.make_move(player_id, move):
        emit('confirm-player-move',
             json.dumps({'field': move, 'turn': game.turn}), to=game_id)

    if game.check_if_won(move, player_id):
        lobbies[game_id].game_over()

        print("WOOOOOOOOONNNNNNNNNNNNN")
        emit('game-over', json.dumps({'winner': player_id}),
             to=game_id)

        del game
        leave_room(game_id)

    if game.check_if_tie():
        lobbies[game_id].game_over()

        emit('tie', to=game_id)

        if game:
            del game
        leave_room(game_id)


@socketio.on('player-surrender')
def handle_player_surrender(res):
    game_id = res['gameID']
    game = rooms[res['gameID']]
    player_id = session['user_id']

    lobbies[game_id].game_over()

    emit('confirm-surrender',
         json.dumps({'winner': lobbies['game_id'].get_other_player(player_id)}),
         to=game_id)

    del game
    leave_room(game_id)


def initGame(game_id, p1, p2):

    if game_id not in rooms:
        # TODO: put later player id from registration
        rooms[game_id] = GameBoard(p1, p2)

    lobbies[game_id].is_game_running = True

    emit("load-game", rooms[game_id].convert_to_obj(), to=game_id)


if __name__ == '__main__':
    socketio.run(app)
