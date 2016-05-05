############################################################
# Dockerfile to build the DataStore micro-service.
# Based on a Node image.
############################################################

FROM node:0.12.7

MAINTAINER Luis Capelo <capelo@un.org>

# Clone app and install dependencies.
RUN \
  npm install -g pm2

ADD . /hdx-monitor-datastore

WORKDIR "/hdx-monitor-datastore"

# Running setup script.
RUN \
  npm install && make setup

EXPOSE 5000

CMD ["pm2", "start", "server.js", "--no-daemon"]
