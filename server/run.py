import logging

import socketio
from flask import Blueprint, Flask, request
from flask_restful import Api, Resource
from flask_cors import CORS

from views.docker_view import Docker, Dockers, handle_init, handle_command

backend_blueprint = Blueprint('emr-v1', __name__)

application = Flask(__name__)
CORS(application)

api = Api(backend_blueprint)

sio = socketio.Server(cors_allowed_origins=["http://localhost:3001"])
application.wsgi_app = socketio.WSGIApp(sio, application.wsgi_app)

application.register_blueprint(backend_blueprint, url_prefix='/api/v1')

@sio.on("init_console")
def socket_handle_init(sid, data):
    handle_init(sid,data, sio)

@sio.on("handle_command")
def socket_handle_command(sid, data):
    handle_command(sid, data, sio)


@sio.on("message")
def handle_message(sid, data):
    print(sid, data)
    sio.emit("message", "Received !!!", to=sid)

class Test(Resource):

    @staticmethod
    def get():

        sio.emit("message", "Received !!!")

        return {"success": True}, 200

api.add_resource(Docker, "/docker")
api.add_resource(Dockers, "/docker/<string:container_id>")
api.add_resource(Test, "/test")

if __name__ == '__main__':
    # Flaskapp is served via gunicorn on port 8000
    application.run(debug=True, host="0.0.0.0")