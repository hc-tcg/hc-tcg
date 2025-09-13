#syntax=docker/dockerfile:1.7-labs

FROM node:24-bookworm

ARG APP_VERSION
ENV APP_VERSION $APP_VERSION
ENV CI true

#######################################################################

RUN mkdir /app
WORKDIR /app

RUN apt-get install imagemagick

COPY . .

COPY config.example.js config.js

RUN npm ci

RUN npm run build

# Remove the build-time dependencies to keep the image small and enable node optimizations.
ENV NODE_ENV production
RUN npm install

LABEL fly_launch_runtime="nodejs"

CMD [ "npm", "run", "start" ]
