FROM docker:20.10-dind

RUN apk add socat

#ENTRYPOINT ["socat", "TCP-LISTEN:2375,reuseaddr,fork", "unix:///var/run/docker.sock"]