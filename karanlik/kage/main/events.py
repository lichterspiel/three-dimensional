from flask import session, request
from flask_socketio import emit, join_room, leave_room
import json

from .. import socketio
from ..game_board import GameBoard
from config import lobbies, games


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
        emit("load-game", games[game_id].convert_to_obj(), to=request.sid)


@socketio.on('player-move')
def handle_player_move(res):
    game_id = res['gameID']
    game = games[res['gameID']]
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
    game = games[res['gameID']]
    player_id = session['user_id']

    lobbies[game_id].game_over()

    emit('confirm-surrender',
         json.dumps({'winner': lobbies['game_id'].get_other_player(player_id)}),
         to=game_id)

    del game
    leave_room(game_id)


def initGame(game_id, p1, p2):

    if game_id not in games:
        # TODO: put later player id from registration
        games[game_id] = GameBoard(p1, p2)

    lobbies[game_id].is_game_running = True

    emit("load-game", games[game_id].convert_to_obj(), to=game_id)
