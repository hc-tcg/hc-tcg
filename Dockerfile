FROM debian:bullseye as builder

ARG NODE_VERSION=16.16.0

RUN apt-get update
RUN apt-get install -y \
  curl \
  python-is-python3 \
  pkg-config \
  build-essential

RUN curl https://get.volta.sh | bash
ENV VOLTA_HOME /root/.volta
ENV PATH /root/.volta/bin:$PATH
RUN volta install node@${NODE_VERSION}

#######################################################################

RUN mkdir /app
WORKDIR /app

COPY . .

RUN npm ci && npm run build
FROM debian:bullseye

LABEL fly_launch_runtime="nodejs"

COPY --from=builder /root/.volta /root/.volta
COPY --from=builder /app /app

WORKDIR /app
ENV NODE_ENV production
# Remove the build-time dependencies to keep the image small
RUN npm install
ENV PATH /root/.volta/bin:$PATH

CMD [ "npm", "run", "docker-start" ]
