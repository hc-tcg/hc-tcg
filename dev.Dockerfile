FROM node:24-bookworm

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

CMD [ "npm", "run", "dev" ]

