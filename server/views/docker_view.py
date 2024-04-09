import os
from kubernetes import client, config
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
        # tls_config = docker.tls.TLSConfig(
        #     client_cert=('/certs/client/cert.pem', '/certs/client/key.pem'),
        #     ca_cert='/certs/client/ca.pem',
        #     verify=True
        # )
        # client = docker.DockerClient(base_url="tcp://docker:2376", tls=tls_config)
        # container = client.containers.run(
        #     "ghcr.io/cedana/cedana:latest",
        #     # "ubuntu",
        #     entrypoint="timeout",
        #     command="-s SIGKILL 120 /bin/bash",
        #     tty=True,
        #     auto_remove=True,
        #     detach=True,
        #     stderr=True,
        #     stdin_open=True,
        #     stdout=False
        # )

        # Example using the Kubernetes Python client
        # from kubernetes import client, config
        #
        config.load_kube_config(config_file="/.kube/config")  # Load config from .kube/config
        v1 = client.CoreV1Api()
        pod_manifest = {
            "apiVersion": "v1",
            "kind": "Pod",
            "metadata": {"name": "cedana-pod2"},
            "spec": {
                "containers": [{
                    "name": "cedana-pod2",
                    "image": "ghcr.io/cedana/cedana:latest",
                    "command": ["/bin/sh"],
                    "tty": True,
                    "stdin": True,
                    "securityContext": {
                        ""
                    }
                }]
            }
        }
        pod = v1.create_namespaced_pod(namespace="default", body=pod_manifest)

        # container.stop()

        return {"success": True, "id": 1}, 201


class Dockers(Resource):

    @staticmethod
    def delete(container_id):
        client = docker.from_env()
        container = client.containers.get(container_id)

        container.stop(timeout=1)
        return {"success": True}, 200
