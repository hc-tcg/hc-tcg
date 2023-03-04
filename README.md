# HC-TCG
https://www.reddit.com/r/HermitCraft/comments/10wksaw/hctcg_online/

## Node.js
Use Node.js 16-18 (19+ is not supported).

## Installation

Please use `npm ci` to avoid unnecesary changes in package-lock.json.

---

## How to run the project

### `npm run build`

Creates a build for frontend.

### `npm start`

Runs the server.

---

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

---

## Development

### `npm run dev`
To run frontend in development mode.

### Formatting & coding style
We run lint/prettier/tsc as part of the PR process. However if you want to avoid back and forth we recommend adding a pre-commit hook that will test this for you locally every time you create a new commit:
`npm run husky`

We also recommend to run prettier on save in your editor, this is an example configuration using the prettier extension for VSCode:

`.vscode/settings.json`
```json
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