import os

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_wtf.csrf import CSRFProtect

from flask_session import Session

socketio = SocketIO(
    cors_allowed_origins="http://localhost:3000",
    supports_credentials=True,
    manage_session=False,
)


def create_app(test_config=None, debug=False):
    # create and configure the app

    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        DEBUG=debug,
        SECRET_KEY="secret_sauce",
        SESSION_TYPE="filesystem",
        SESSION_COOKIE_HTTPONLY=True,
        REMEMBER_COOKIE_HTTPONLY=True,
        SESSION_PERMANENT=False,
        SESSION_COOKIE_SAMESITE="Lax",
        DATABASE=os.path.join(app.instance_path, "karanlik.sqlite"),
    )

    CORS(
        app,
        resources={r"*": {"origins": "http://localhost:3000"}},
        expose_headers=["Content-Type", "X-CSRFToken"],
        origins=["http://localhost:3000"],
        supports_credentials=True,
    )

    csrf = CSRFProtect(app)

    Session(app)

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile("config.py", silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    from .main import main as main_blueprint

    app.register_blueprint(main_blueprint)

    socketio.init_app(app)
    return app
