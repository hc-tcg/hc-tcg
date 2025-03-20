# HC-TCG

https://www.reddit.com/r/HermitCraft/comments/10wksaw/hctcg_online/

## Node.js

Use Node.js 16-18 (19+ is not supported).

If you don't have Node.js yet we recommend using [nvm](https://github.com/nvm-sh/nvm).

## How to run Hermitcraft TCG

```sh
npm ci                      # install packages
npm run build-dev           # build a developement build of the client
npm run build-dev-windows   # build a developement build of the client on windows
npm run server              # start the sever
```

_Please use `npm ci` instead of instead of `npm install` to avoid unneccesary changes in package-lock.json._

## Running in your development environment

Before you can run the game locally, you will need to create the debug config file. To do this, run `cp ./common/config/debug-config.example.js ./common/config/debug-config.js` on Linux, and `copy ./common/config/debug-config.example.js ./common/config/debug-config.js` on Windows.

```sh
npm ci               # install packages

npm run server:dev   # start the server and update automatically when you make changes
npm run client:dev   # start the client and update automatically when you make changes

npm run dev          # start both the client and server
```

If you need to test code that interacts with the database, you can use our development docker compose file:
```
# docker-compose -f docker-compose-dev.yml up
```

_Please use `npm ci` instead of instead of `npm install` to avoid unneccesary changes in package-lock.json._

By default, the client is hosted on port 3002.

## How To & Architecture

See [docs/README.md](./docs/README.md).

## Configuration

### Server Config

Your instance can be configured using the `common/config/server-config.js` file.

| Key           | Description                                                                         |
| ------------- | ----------------------------------------------------------------------------------- |
| port          | Server port                                                                         |
| clientDevPort | Port for vite client server                                                         |
| clientPath    | Path for the client build used                                                      |
| cors          | Useful when testing on local network or when your server runs on a different domain |
| world         | Identifier for your instance when tracking stats                                    |
| limits        | Limits for players' decks                                                           |
| logoSubText   | Animated text to show next to logo                                                  |
| botUrl        | Url to report game results to                                                       |
| version       | Version displayed on the client                                                     |

### Debug Config

You can configure debug settings using `common/config/debug-config.js`. See the developement environment section for instructions on how to creat this file.

| Key                   | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| disableDeckValidation | Disable deck validation                                                     |
| extraStartingCards    | Add extra cards into your hand at the start of the game.                    |
| noItemRequirements    | Remove item requirements for attacks.                                       |
| forceCoinFlip         | Force coinflips to always roll heads.                                       |
| oneShotMode           | All attacks will instantly knock out their target.                          |
| disableDamage         | Disable attacks from dealing damage.                                        |
| disableDeckOut        | Disable the deck out win condition.                                         |
| startWithAllCards     | Start the game with every card in your deck. Also disables deck out.        |
| unlimitedCards        | Start the game with every card in the game. Also disables deck out.         |
| blockedActions        | Block specific actions every turn.                                          |
| availableActions      | Make specific actions available every turn.                                 |
| shuffleDeck           | Shuffe the player's decks at the start of the game.                         |
| logErrorsToStderr     | Log assertion errors in turn acitons to stderr instead of throwing them.    |
| showHooksState        | Show hooks in the console.                                                  |
| autoEndTurn           | When you have no actions left, automatically switch to the opponent's turn. |
| statsUrl              | URL to use for the Hall of Fame.                                            |

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
```
npm run build
```

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
