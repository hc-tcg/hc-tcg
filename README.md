# HC-TCG
https://www.reddit.com/r/HermitCraft/comments/10wksaw/hctcg_online/

## Node.js
Use Node.js 16-18 (19+ is not supported).

If you don't have Node.js yet we recommend using [nvm](https://github.com/nvm-sh/nvm).

## Installation

```console
npm ci
```
*Please use `npm ci` instead of `npm install` to avoid unnecesary changes in package-lock.json.*

## How to run the project

To create a build for frontend:
```console
npm run build
```

To run the server:
```console
npm start
```

## Configuration
You can configureyour instance using the `config/server-config.json` file.


| Key            | Description    |
|----------------|----------------|
| port           | Server port    |
| clientDevPort  | Port for vite dev. server |
| cors           | Useful when testing on local network or when your server runs on a different domain |
| world          | Identifier for your instance when tracking stats |
| limits         | Limits for players' decks |
| logoSubText    | Animated text to show next to logo |

## Development

To run frontend in development mode:
```console
npm run dev
```


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