from flask import Flask, session
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
rooms = {}
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


@socketio.on('pls-init')
def handle_init(rq):
    gameId = rq['gameId']

    playerId = session['userId']

    if gameId not in rooms:
        # TODO: put later player id from registration
        rooms[gameId] = {
            'board': [[empty_field for i in range(3)]for i in range(3)],
            'turn': 0,
            'count': 1,
            playerId: 0
        }
        print(rooms[gameId])
    else:
        if playerId not in rooms[gameId] and rooms[gameId]['count'] == 2:
            return
        elif playerId in rooms[gameId] and rooms[gameId]['count'] == 2:
            emit("load-game", json.dumps(rooms[gameId]), to=gameId)
            return
        else:

            rooms[gameId][playerId] = 1
            rooms[gameId]['count'] += 1
            print(rooms[gameId])
            emit("init-game", json.dumps(rooms[gameId]), to=gameId)

# here emit initGame to start the game
# and get information of the users and send to everyone


@socketio.on('connect')
def handle_connect(rq):
    pass


@socketio.on('player-join')
def handle_player_join(rq):
    gameId = rq['gameId']
    print(session['userId'])

    join_room(gameId)
    emit('player-joined', to=rq['gameId'])


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
