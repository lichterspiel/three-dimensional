from flask import Flask
from flask_socketio import SocketIO, emit
import json
import math

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.config['DEBUG'] = True
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

games = {}


@socketio.on('pls-init')
def handle_init(req):

    gameId = req['gameId']
    playerId = req['playerId']

    if gameId not in games:
        # TODO: put later player id from registration
        games[gameId] = {
            'board': [[3 for i in range(3)]for i in range(3)],
            'p1': playerId,
            'p2': 0,
            'turn': 0
        }
        emit("init-game", json.dumps({'playerNum': 0}))
    else:
        games[gameId]['p2'] = playerId
        emit("init-game", json.dumps({'playerNum': 1}))


@socketio.on('player-move')
def handle_player_move(res):
    game = games[res['gameId']]
    board = game['board']
    if game['turn'] == res['playerNum']:
        board[math.floor(res['field'] / 3)][res['field'] % 3] = res['playerNum']
        game['turn'] = 1 if game['turn'] == 0 else 0
        emit('confirm-player-move', json.dumps({'field': res['field']}))


if __name__ == '__main__':
    socketio.run(app)
