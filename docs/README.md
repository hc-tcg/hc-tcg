## Project Structure

This project is built around the `express`, `pg`, `redux`, `react`, and `redux-saga` libraries.
- `react` is used for rendering the visuals for the client.
- `redux` is used on the client to maintain state. `redux-saga` is used to run background tasks on the client, such as listening for the opponent to make a move and updating the game state as neccesary.
- `express` is used on the server for HTTP endpoints.
- `pg` is the library we use to connect to our postgres database.

### Some important files and directories in the projects.

- `client` - The code for the client.
	- `app` - The pages for the game.
	- `components` - Different react objects used on various pages of the game.
	- `logic` - Redux saga background tasks. In here you will find the login code and game code for example.
		- `session` - The code for managing the user session. This directory contains the redux saga code and redux store for login.
- `common` - Code shared between the server and client. This includes all the game code.
	- `cards` - The code for all the game cards.
	- `achievements` - The code for all the game achievements.
	- `components` - The code for the game components. See the "How to use Game APIs" section of the docs.
- `server` - The code for the server.
	- `api` - The HTTP api endpoints. These are used for statistics, authentication, and other various endpoints. You can find more information in [API.md](./API.md).
	- `db` - The code to connect to the database.
	- `routines` - Background tasks on the server. This is where the game code is run on the server.
		- `matchmaking.ts` - All the code to manage creating games.
		- `game.ts` - The code to run the game!

## Game Documentation

See [/GAME.md](./GAME.md).

