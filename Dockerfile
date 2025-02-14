FROM node:18.20-bookworm

ARG APP_VERSION
ENV APP_VERSION $APP_VERSION
ENV CI true

#######################################################################

RUN mkdir /app
WORKDIR /app

RUN apt-get install imagemagick

COPY . .

COPY common/config/debug-config.example.js common/config/debug-config.js

RUN npm ci

RUN npx playwright install --with-deps firefox
RUN npm run client:render-cards
RUN npm run build

# Remove the build-time dependencies to keep the image small and enable node optimizations.
ENV NODE_ENV production
RUN npm install

LABEL fly_launch_runtime="nodejs"

CMD [ "npm", "run", "start" ]
