import os

import docker
from flask_restful import Resource


class Docker(Resource):

    @staticmethod
    def get():
        client = docker.from_env()
        img_list = client.images.list()
        return {"success": [i.tags for i in img_list]}, 200

    @staticmethod
    def post():
        tls_config = docker.tls.TLSConfig(
            client_cert=('/certs/client/cert.pem', '/certs/client/key.pem'),
            ca_cert='/certs/client/ca.pem',
            verify=True
        )
        client = docker.DockerClient(base_url="tcp://docker:2376", tls=tls_config)
        container = client.containers.run(
            "ghcr.io/cedana/cedana:latest",
            command="/bin/sh",
            tty=True,
            auto_remove=True,
            detach=True,
            stderr=True,
            stdin_open=True,
            stdout=False
        )

        return {"success": True, "id": container.id}, 201


class Dockers(Resource):

    @staticmethod
    def delete(container_id):
        client = docker.from_env()
        container = client.containers.get(container_id)

        container.stop(timeout=1)
        return {"success": True}, 200
