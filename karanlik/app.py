from flask import Flask, jsonify, session
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


rooms = {}


@app.route('/session', methods=['GET'])
def index():
    userId = str(uuid.uuid4())
    if 'userId' not in session:
        session['userId'] = userId
    print("========index========")
    print(session)
    print(session.sid)
    print("========index========")

    return '', 204


@app.route('/test', methods=['GET'])
def test():
    print("===========test========")
    print(session)
    print(session.sid)
    print("===========test========")

    return '', 204


@socketio.on('pls-init')
def handle_init(rq):
    gameId = rq['gameId']
    print("===========init========")
    print(session)
    print(session.sid)
    print("===========init========")

    playerId = session['userId']

    if gameId not in rooms:
        # TODO: put later player id from registration
        rooms[gameId] = {
            'board': [[3 for i in range(3)]for i in range(3)],
            playerId: 0,
            'turn': 0,
            'count': 1
        }
    else:
        if playerId not in rooms[gameId].keys():
            if rooms[gameId]['count'] == 2:
                return

            rooms[gameId][playerId] = 1
            rooms[gameId]['count'] += 1
            emit("init-game", jsonify(rooms[gameId]))

# here emit initGame to start the game
# and get information of the users and send to everyone


@socketio.on('connect')
def handle_connect(rq):
    print(session)
    pass



@socketio.on('player-join')
def handle_player_join(rq):
    gameId = rq['gameId']

    join_room(gameId)
    emit('player-joined', to=rq['gameId'])


@socketio.on('player-move')
def handle_player_move(res):
    game = rooms[res['gameId']]
    board = game['board']
    playerId = session['userId']

    if game['turn'] == game[playerId]:
        board[math.floor(res['field'] / 3)][res['field'] % 3] = game[playerId]
        game['turn'] = 1 if game['turn'] == 0 else 0
        emit('confirm-player-move',
             json.dumps({'field': res['field']}),
             to=res['gameId'])


if __name__ == '__main__':
    socketio.run(app)
