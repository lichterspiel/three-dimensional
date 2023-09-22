from flask import jsonify

from kage import utils
from . import main


@main.route("/apiT/lobbies")
def get_lobbies_test():
    print(jsonify(utils.generate_dummy_lobby()))
    return jsonify(utils.generate_dummy_lobby()), 200
