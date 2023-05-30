from flask import Flask, session, request
from flask_session import Session
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS
import math
import uuid
import json

app = Flask(__name__)
app.config.update(
    DEBUG=True,
    SECRET_KEY="secret_sauce",
    SESSION_TYPE='filesystem',
    SESSION_COOKIE_SAMESITE='Lax'
)

CORS(app,
     resources={r"*": {"origins": "http://localhost:3000"}},
     origins=['http://localhost:3000'],
     supports_credentials=True)

Session(app)
socketio = SocketIO(app,
                    cors_allowed_origins="http://localhost:3000",
                    manage_session=False)


empty_field = 9
# rooms is the game and lobby is before the game starts the initial phase
# where we wait until 2 players joined
rooms = {}
lobby = {}
magicSquare = [
                [8, 1, 6],
                [3, 5, 7],
                [4, 9, 2],
              ]


@app.route('/session', methods=['GET'])
def index():
    userId = str(uuid.uuid4())
    if 'userId' not in session:
        session['userId'] = userId
    return '', 204


def initGame(gameId, p1, p2):
    if gameId not in rooms:
        # TODO: put later player id from registration
        rooms[gameId] = {
            'board': [[empty_field for i in range(3)]for i in range(3)],
            'turn': 0,
            'p1': p1,
            'p2': p2,
            p1: 0,
            p2: 1,
        }
    emit("load-game", json.dumps(rooms[gameId]), to=request.sid)

# here emit initGame to start the game
# and get information of the users and send to everyone


@socketio.on('connect')
def handle_connect(rq):
    pass


@socketio.on('player-join')
def handle_player_join(rq):
    gameId = rq['gameId']

    join_room(gameId)

    if gameId not in lobby:
        lobby[gameId] = {
                'p1': session['userId'],
                'count': 1,
        }
    if session['userId'] not in lobby[gameId].values() and lobby[gameId]['count'] == 1:
        lobby[gameId]['p2'] = session['userId']
        lobby[gameId]['count'] = 2
        initGame(gameId, lobby[gameId]['p1'], lobby[gameId]['p2'])

    emit("send-id", session['userId'], to=request.sid)
    emit("load-game", json.dumps(rooms[gameId]), to=request.sid)



# TODO: this should not overwrite moves check
@socketio.on('player-move')
def handle_player_move(res):
    game = rooms[res['gameId']]
    board = game['board']
    playerId = session['userId']
    move = res['field']

    if game['turn'] == game[playerId] and board[math.floor(move / 3)][move % 3] == empty_field:
        board[math.floor(move / 3)][move % 3] = game[playerId]

        if check_if_won(board, move, game['turn']):
            emit('game-over', json.dumps({'winner': game['turn']}), to=res['gameId'])
            return

        game['turn'] = 1 if game['turn'] == 0 else 0

        emit('confirm-player-move',
             json.dumps({'field': move}),
             to=res['gameId'])


# TODO: definetly rework this haha
def check_if_won(board, lastMove, turn):

    count = 0
    # check row of last move
    rowCheck = board[math.floor(lastMove / 3)]
    for i, value in enumerate(rowCheck):
        if turn == value:
            count += magicSquare[math.floor(lastMove / 3)][i]
    if count == 15:
        return True

    count = 0
    # check column of last move
    for i, row in enumerate(board):
        if row[lastMove % 3] == turn:
            count += magicSquare[i][lastMove % 3]
    if count == 15:
        return True

    count = 0
    # diagonal check
    for i, row in enumerate(board):
        if row[i] == turn:
            count += magicSquare[i][i]
    if count == 15:
        return True

    count = 0
    # anti diagonal check
    for i, row in enumerate(board):
        if row[len(row) - 1 - i] == turn:
            count += magicSquare[i][len(row) - 1 - i]
    if count == 15:
        return True

    return False


if __name__ == '__main__':
    socketio.run(app)
