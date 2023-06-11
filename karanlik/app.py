from flask import Flask, session, request
from flask_session import Session
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS
import uuid
import json

from game_board import GameBoard
from lobby import Lobby


app = Flask(__name__)
app.config.update(
    DEBUG=True,
    SECRET_KEY="secret_sauce",
    SESSION_COOKIE_SAMESITE='Lax'
)

CORS(app,
     resources={r"*": {"origins": "http://localhost:3000"}},
     origins=['http://localhost:3000'],
     supports_credentials=True)

Session(app)
socketio = SocketIO(app,
                    cors_allowed_origins="http://localhost:3000",
                    manage_session=True)

# rooms is the game and lobby is before the game starts the initial phase
# where we wait until 2 players joined
rooms = {}
lobby = {}


@socketio.on('connect')
def handle_connect(rq):
    userId = str(uuid.uuid4())
    if 'userId' not in session:
        session['userId'] = userId


def initGame(gameId, p1, p2):
    if gameId not in rooms:
        # TODO: put later player id from registration
        rooms[gameId] = GameBoard(p1, p2)

    emit("load-game", rooms[gameId].convert_to_obj(), to=gameId)


@socketio.on('player-join')
def handle_player_join(rq):
    gameId = rq['gameId']
    print(request.sid + "JOINED")

    join_room(gameId)

    emit("send-id", session['userId'], to=request.sid)

    if gameId not in lobby:
        lobby[gameId] = Lobby(session['userId'])

    if lobby[gameId].join_player(session['userId']):
        initGame(gameId, lobby[gameId].p1, lobby[gameId].p2)

    if lobby[gameId].check_player_in_lobby(session['userId']):
        emit("load-game", rooms[gameId].convert_to_obj(), to=request.sid)


# TODO: this should not overwrite moves check
@socketio.on('player-move')
def handle_player_move(res):
    game = rooms[res['gameId']]
    playerId = session['userId']
    move = res['field']

    if game.make_move(playerId, move):
        emit('confirm-player-move',
             json.dumps({'field': move, 'turn': game.turn}), to=res['gameId'])

    if game.check_if_won(move):
        lobby[res['gameId']].isGameRunning = False
        emit('game-over', json.dumps({'winner': playerId}),
             to=res['gameId'])
        del game
        del lobby[res['gameId']]


if __name__ == '__main__':
    socketio.run(app)
