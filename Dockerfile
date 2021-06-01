FROM node:8
USER root

ENV YJS_RESOURCE_PATH "/socket.io"
ENV PORT 8070

RUN apt-get update
RUN apt-get install -y --no-install-recommends supervisor git nginx
RUN npm_config_user=root npm install -g grunt-cli grunt polymer-cli

COPY docker /usr/src/app/docker
COPY docker/supervisorConfigs /etc/supervisor/conf.d

COPY app /usr/src/app/app
WORKDIR /usr/src/app/app
RUN npm install

COPY widgets /usr/src/app/widgets
WORKDIR /usr/src/app/widgets
RUN npm install

WORKDIR /usr/src/app
COPY docker/docker-entrypoint.sh docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
