# HC-TCG

An unofficial implementation of [Vintage Beef](https://www.youtube.com/@VintageBeef)'s Hermitcraft TCG!

## Node.js

Use Node.js 20+.
If you don't have Node.js yet we recommend using [nvm](https://github.com/nvm-sh/nvm) or [asdf](https://asdf-vm.com/).

## Set Up Dev Environment

<details>
<summary>Run project with docker (reccomended)</summary>
<br>

First you will need to create the debug config file.  To do this, run `cp ./config.example.js ./config.js` on Linux, and `copy ./config.example.js ./config.js` on Windows.

You can then use the following command:
```
npm run docker-dev          # start the docker development image
```

By default, the client is hosted on port 3002. This image will automatically setup postgresql for you.
</details>


<details>
<summary>Run project without docker</summary>
<br>

## Running in your development environment

First you will need to create the debug config file.  To do this, run `cp ./config.example.js ./config.js` on Linux, and `copy ./config.example.js ./config.js` on Windows.
You can then use the following commands:

```sh
npm ci               # install packages

npm run dev          # start both the client and server

npm run server:dev   # start the server and update automatically when you make changes
npm run client:dev   # start the client and update automatically when you make changes
```

_Please use `npm ci` instead of instead of `npm install` to avoid unneccesary changes in package-lock.json._

By default, the client is hosted on port 3002.

Certain functions will not work if postgres is not installed. To develop parts of the game that interact with the database,
either install [postgresql](https://www.postgresql.org/) or run the program with docker.

</details>

## How To & Architecture

See [docs/README.md](./docs/README.md).

## Configuration

See `./config.example.js`

### Formatting & coding style

We run Biome's linter and formatter as part of the PR process. You can use these commands to lint your code:

```sh
npm run lint      # check your code for linting and formatting issues
npm run format    # format your code
npm run fix       # fix any autofixable linting errors
```

### Testing

This project contains a few tests that are run against every PR.

```sh
npm run test                # run all the tests
npm run test:unit           # run unittests written with jest, this will catch most errors.
npm run test:unit-verbose   # run unittests written with jest and print verbose logs for debugging.
npm run test:vunit          # the same as test:unit-verbose
npm run test:starter-decks  # run starter deck verification check
npm run test:db             # run database tests
npm run test:ct             # run component tests with playwright.
npm run test:ct-update      # update component snapshots.
npm run test:api            # run tests for the hc-tcg API.
npm run test:e2e            # run end-to-end tests with Playwright.
npm run test:fuzz           # run fuzz tests (see tests/README.md for more details).
```

# Building & Self Hosting

To build you must run these commands:
```sh
npm ci                      # install packages
npm run build-dev           # build a developement build of the client
npm run build-dev-windows   # build a developement build of the client on windows
```

_Please use `npm ci` instead of instead of `npm install` to avoid unneccesary changes in package-lock.json._

To build the cards you must have `sh` and `imagemagick` installed along with the project dependencies.
```
npm run client:render-cards
```

Alternitively, you can use our [Docker](https://docs.docker.com/) image, which will have all the project dependencies set up for you.
To build a docker image, cd to the root of the project then run the command:

```sh
docker build . --build-arg APP_VERSION=$(git rev-parse --short HEAD)
docker run -p 9000:9000 <Image Id>
```

To host the project with the image on [docker hub](https://hub.docker.com/r/benji42/hc-tcg), install the docker-compose plugin, create a directory with the docker-compose.yml file (/etc/hctcg by default, can be changed by editing docker-compose.yml), create a directory in there for the db (mkdir -p /etc/hctcg/db or edit the docker-compose.yml if using a different directory) then run the command:

```sh
docker-compose up -d
```

By default, the server will listen to requests on port 9000.  The instance can be backed up by backing up the contents of /etc/hctcg (or whatever directory you specify).

