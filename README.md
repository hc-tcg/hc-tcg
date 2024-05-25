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

*Please use `npm ci` instead of instead of `npm install` to avoid unneccesary changes in package-lock.json.*

# Running in your development environment
```sh
npm ci               # install packges
npm run server:dev   # start the server and update automatically when you make changes
npm run client:dev   # start the client and update automatically when you make changes
npm run dev          # start both the client and server
```
By default, the client is hosted on port 3002.

## Configuration

Your instance can be configured using the `config/server-config.json` file.

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

### Formatting & coding style

We run lint/prettier/tsc as part of the PR process. However if you want to avoid back and forth we recommend adding a pre-commit hook that will test this for you locally every time you create a new commit:

```console
npm run husky
```

We also recommend to run prettier on save in your editor, this is an example configuration using the prettier extension for VSCode:

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
