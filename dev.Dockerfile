FROM node:22.9.0-bullseye

ARG APP_VERSION
ENV APP_VERSION $APP_VERSION
ARG DEV
ENV CI true

#######################################################################

RUN mkdir /app
WORKDIR /app

RUN apt-get install imagemagick

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci

COPY common/config/debug-config.example.js common/config/debug-config.js
COPY version.js version.js

COPY common common
COPY server server
COPY client client

CMD [ "npm", "run", "dev" ]

