import datetime
import os
import time
from ssl import SSLEOFError

from kubernetes import client, config
import docker
from flask_restful import Resource
from kubernetes.client import ApiException
from kubernetes.stream import stream
import uuid

from websocket import WebSocketConnectionClosedException

max_container = 3
class Docker(Resource):

    @staticmethod
    def get():
        config.load_kube_config(config_file="/.kube/config")  # Load config from .kube/config
        v1 = client.CoreV1Api()

        resp = v1.list_namespaced_pod("default")

        list_of_pods = [i.metadata.name for i in resp.items if "cedana" in i.metadata.name]

        return {"current_count": len(list_of_pods), "max_count": max_container}, 200

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

        resp = v1.list_namespaced_pod("default")
        list_of_pods = [i.metadata.name for i in resp.items if "cedana" in i.metadata.name]
        if len(list_of_pods) == max_container:
            return {"message": "Max container limit reached"}, 400

        name = "cedana-pod-" + str(uuid.uuid4())

        pod_manifest = {
            "apiVersion": "v1",
            "kind": "Pod",
            "metadata": {"name": name} ,
            "spec": {
                "containers": [{
                    "name": "cedana-pod",
                    "image": "ghcr.io/cedana/cedana:latest",
                    "command": ["/bin/bash"],
                    # "entrypoint": "timeout",
                    "tty": True,
                    "stdin": True,
                }]
            }
        }
        v1.create_namespaced_pod(namespace="default", body=pod_manifest)

        # container.stop()

        return {"success": True, "id": name}, 201


class Dockers(Resource):

    @staticmethod
    def delete(container_id):
        client = docker.from_env()
        container = client.containers.get(container_id)

        container.stop(timeout=1)
        return {"success": True}, 200

    @staticmethod
    def get(container_id):
        config.load_kube_config(config_file="/.kube/config")  # Load config from .kube/config
        v1 = client.CoreV1Api()
        res = v1.read_namespaced_pod(container_id, "default")
        return {"success": {"created_at": res.metadata.creation_timestamp.strftime("%Y-%m-%dT%H:%M:%S")}}, 200

global mapping
mapping = {}
def handle_init(sid, data, sio):
    config.load_kube_config(config_file="/.kube/config")
    v1 = client.CoreV1Api()
    exec_command = ['/bin/sh']

    global mapping

    # resp = stream(v1.connect_get_namespaced_pod_exec,
    #               data,
    #               'default',
    #               command=exec_command,
    #               stderr=True, stdin=True,
    #               stdout=True, tty=True,
    #               _preload_content=True)

    start_time = time.time()
    while time.time() - start_time <= 10000:

        try:

            resp = stream(v1.connect_get_namespaced_pod_attach,
                          name=data,
                          namespace='default',
                          stderr=True, stdin=True,
                          stdout=True, tty=True,
                          _preload_content=False)

            break
        except ApiException:
            pass
    else:
        raise Exception("Timeout")

    mapping[sid] = resp

    sio.emit("terminal_ready", "success", to=sid)

def handle_command(sid, data, sio):
    try:
        if resp:= mapping.get(sid):

            resp.write_stdin(data)

            while data:= resp.read_stdout(timeout=10):
                sio.emit("message", data, to=sid)
    except (WebSocketConnectionClosedException, SSLEOFError):
        sio.emit("terminal_kill", data, to=sid)

