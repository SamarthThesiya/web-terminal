from kubernetes import client, config

config.load_kube_config(config_file='/.kube/config')
v1 = client.CoreV1Api()

print(v1.list_namespaced_pod(""))