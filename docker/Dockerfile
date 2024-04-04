FROM docker:20.10-dind

#FROM docker:18.09-dind
#
RUN apk update && \
    apk add socat openrc

#RUN socat TCP-LISTEN:7000,reuseaddr,fork unix:///var/run/docker.sock &
#
#COPY docker/services/socat_forward /etc/init.d/socat_forward
#
#RUN chmod +x /etc/init.d/socat_forward
#
#RUN rc-update add socat_forward default

#RUN socat TCP-LISTEN:7000,reuseaddr,fork unix:///var/run/docker.sock

# RUN apk add docker-openrc
#    rc-service docker start
#
#RUN chmod 777 /usr/local/bin/docker
#ENTRYPOINT ["socat TCP-LISTEN:7000,reuseaddr,fork unix:///var/run/docker.sock"]