FROM debian:bookworm

ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION
ARG NODE_VERSION=16.16.0

RUN apt-get update
RUN apt-get install -y \
  curl \
  python-is-python3 \
  pkg-config \
  build-essential

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
RUN source ~/.bashrc
RUN nvm install ${NODE_VERSION}

#######################################################################

RUN mkdir /app
WORKDIR /app

COPY . .

COPY common/config/debug-config.example.json common/config/debug-config.json

RUN npm ci && npm run build
# Remove the build-time dependencies to keep the image small and enable node optimizations.
ENV NODE_ENV production
RUN npm install

LABEL fly_launch_runtime="nodejs"

CMD [ "npm", "run", "start" ]
