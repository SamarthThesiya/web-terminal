import asyncio
import ssl
from pprint import pprint

from kubernetes import client, config
from kubernetes.client import ApiException
from kubernetes.stream import stream

from websocket import create_connection

# ssl_context = ssl.SSLContext()
# ssl_context.check_hostname = False
# ssl_context.verify_mode = ssl.CERT_NONE

headers = {"Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IndxZWtDMkRob0xSbWdYNEZNWHBUcmhOaDg0X3YtallLbVRSZ3pIbU5URWMifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6IndlYnNvY2tldC11c2VyLXRva2VuIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6IndlYnNvY2tldC11c2VyIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiMThmZmFhNDMtZmY2MS00N2Q1LTkzZDgtYjU5ZmU1NTlhMjVlIiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50OmRlZmF1bHQ6d2Vic29ja2V0LXVzZXIifQ.Ji9sqj-KvhLYSleDss8I-AiAd8m8T0Y7e4n6HLo8hO3UMFG0EENPB2-y-CNZ1bgsQt2z234fwOy-w1nQ356Te-8z1pkVwh-NRm0gkQjXBj-TZ540N3CjAanoswelPMWwkNsPrnCispsPptYo2UG7vb9SXKl1FtWXNHzOYTYItmbi8jx-4rW6NMZqG509M5j3LmimQV9pMffDVsFd3tiD4SAU_VswmJVUsV8emifCu-t4AW7sYRNay3KAclHu4JUR6Lq08VXDm4FpTGI7o0bbeYd3B92BoCSn5XM12GbJtIczFNIUXR160O9h8vWmntVj-wR3VLOyUsNLJM4RqTqcJQ"}
# ws = create_connection("wss://kubernetes.docker.internal:6443/api/v1/namespaces/default/pods/cedana-5b5956fb59-l6r8n/attach?stdin=true&stdout=true&tty=true", header=headers, sslopt={"cert_reqs": ssl.CERT_NONE})
#
# # Place your communication logic here
# print(ws.recv())
config.load_kube_config(config_file="/.kube/config")
v1 = client.CoreV1Api()

name = 'cedana-5b5956fb59-l6r8n' # str | name of the PodAttachOptions
namespace = 'default' # str | object name and auth scope, such as for teams and projects
container = 'cedana' # str | The container in which to execute the command. Defaults to only container if there is only one container in the pod. (optional)
stderr = True # bool | Stderr if true indicates that stderr is to be redirected for the attach call. Defaults to true. (optional)
stdin = True # bool | Stdin if true, redirects the standard input stream of the pod for this call. Defaults to false. (optional)
stdout = True # bool | Stdout if true indicates that stdout is to be redirected for the attach call. Defaults to true. (optional)
tty = True # bool | TTY if true indicates that a tty will be allocated for the attach call. This is passed through the container runtime so the tty is allocated on the worker node by the container runtime. Defaults to false. (optional)
#
# api_response = v1.connect_get_namespaced_pod_attach(name, namespace, container=container, stderr=stderr, stdin=stdin, stdout=stdout, tty=tty)
# pprint(api_response)

# v1.api_client.configuration.host = 'https://kubernetes.docker.internal:6443'
# v1.api_client.configuration.verify_ssl = False
# v1.api_client.default_headers = headers

# `stderr`, `stdin`, `stdout`, `tty` set according to your needs
# attach_response = stream(v1.connect_get_namespaced_pod_attach,
#                          name="cedana-5b5956fb59-l6r8n",
#                          namespace="default",
#                          container="cedana",
#                          stderr=True,
#                          stdin=True,
#                          stdout=True,
#                          tty=True)
# print(attach_response)

exec_command = ['/bin/sh']
resp = stream(v1.connect_get_namespaced_pod_exec,
              name,
              'default',
              command=exec_command,
              stderr=True, stdin=True,
              stdout=True, tty=False,
              _preload_content=False)
commands = [
    "echo This message goes to stdout",
    "echo \"This message goes to stderr\" >&2",
]

print(resp)
# ws.close()