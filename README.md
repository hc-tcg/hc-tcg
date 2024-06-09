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
| showHooksState        | Show hooks in the console.                                                  |
| autoEndTurn           | When you have no actions left, automatically switch to the opponent's turn. |

### Formatting & coding style

We run lint/prettier/tsc as part of the PR process. We also recommend to run prettier on save in your editor, this is an example configuration using the prettier extension for VSCode:

```jsonc
// .vscode/settings.json
{
	"[json][jsonc]": {
		"editor.defaultFormatter": "esbenp.prettier-vscode",
		"editor.formatOnSave": true
	},
	"[javascript][typescript][typescriptreact]": {
		"editor.defaultFormatter": "esbenp.prettier-vscode",
		"editor.formatOnSave": true
	},
	"[css][scss]": {
		"editor.defaultFormatter": "esbenp.prettier-vscode",
		"editor.formatOnSave": true
	},
	"typescript.tsdk": "node_modules/typescript/lib"
}
```
