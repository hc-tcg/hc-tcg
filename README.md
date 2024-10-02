# HC-TCG

https://www.reddit.com/r/HermitCraft/comments/10wksaw/hctcg_online/

## Node.js

Use Node.js 16-18 (19+ is not supported).

If you don't have Node.js yet we recommend using [nvm](https://github.com/nvm-sh/nvm).

## How to host Hermitcraft TCG

```sh
npm ci          # install packages
npm run build   # build the client
npm run server  # start the sever
```

_Please use `npm ci` instead of instead of `npm install` to avoid unneccesary changes in package-lock.json._

# Running in your development environment

```sh
npm ci               # install packges
npm run server:dev   # start the server and update automatically when you make changes
npm run client:dev   # start the client and update automatically when you make changes
npm run dev          # start both the client and server
```

By default, the client is hosted on port 3002.

## Configuration

Your instance can be configured using the `common/config/server-config.json` file.

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

You can also configure debug settings using `common/config/debug-config.json`. To create it, copy `common/config/debug-config.example.json` and rename it. On linux you can run `cp ./common/config/debug-config.example.json ./common/config/debug-config.json`, and on windows you can run `copy ./common/config/debug-config.example.json ./common/config/debug-config.json` to create the file.

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
| shuffleDeck           | Shuffe the player's decks at the start of the game.													|
| logErrorsToStderr     | Log assertion errors in turn acitons to stderr instead of throwing them.    |
| showHooksState        | Show hooks in the console.                                                  |
| autoEndTurn           | When you have no actions left, automatically switch to the opponent's turn. |

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
npm run test          # run all the tests
npm run test:unit     # run unittests written with jest, this will catch most errors.
npm run test:snapshot # run snapshot tests with jest.
npm run test:ct       # run component tests with playwright.
npm run test:api      # run tests for the hc-tcg API.
npm run test:e2e      # run end-to-end tests with Playwright.
```

If snapshot tests fail, you may need to update them.

```sh
npm run test:snapshot-update
```


# Building & Self Hosting

[Docker](https://docs.docker.com/) is used for building and self hosting. To build a docker image, cd to the root of the project then run the command:

```sh
docker build . --build-arg APP_VERSION=$(git rev-parse --short HEAD)
```

To host the project with the image on [docker hub](https://hub.docker.com/r/benji42/hc-tcg), install the docker-compose plugin then run the command:

```sh
docker compose up
```

By default, the server will listen to requests on port 9000.
