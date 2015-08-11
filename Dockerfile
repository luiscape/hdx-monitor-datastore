############################################################
# Dockerfile to build the DataStore micro-service.
# Based on a Node image.
############################################################

FROM node:0.12.7

MAINTAINER Luis Capelo <capelo@un.org>

# Clone app and install dependencies.
RUN \
  npm install -g pm2 && \
  git clone https://github.com/luiscape/hdx-monitor-datastore && \
  cd hdx-monitor-datastore && \
  npm install

# Running setup script.
RUN \
  cd hdx-monitor-datastore && make setup

WORKDIR "/hdx-monitor-datastore"

EXPOSE 5000

CMD ["pm2", "start", "server.js", "--no-daemon"]
