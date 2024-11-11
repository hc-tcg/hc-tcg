# Hermitcraft TCG API Documentation

- GET `/api/cards`

Returns a list of all cards.

- GET `/api/types`

Returns a list of all card types and resources for them.

- GET `/api/ranks`

Returns a list of all card ranks and resources for them.

- GET `/api/deck/{deckCode}`

Convert a deck code to `{success: list of cards}` or `{error: reason}`.

- POST `/api/deck/cost`

Request Body: Array<hermit id as string>
Returns the cost of a deck containing the listed cards.

- GET `/api/games/create`

Creates a new game and returns the codes to join it. The game code will time out after five minutes.

| Field | Type | Description |
| :----------- | :--------------: | -------------------------: |
| `gameCode` | string | Code players use to join the game.  |
| `spectatorCode` | string   | Code spectators use to join the game. |
| `apiSecret` | string | Code used to cancel games made with the HC-TCG API |
| `timeOutAt` | int | Time when the game code will no longer be valid. |

- DELETE `/api/games/cancel`

Cancel a game made with the HC-TCG API.

Request Body:
| Field | Type | Description |
| :----------- | :--------------: | -------------------------: |
| `code` | string | The API secret returned with the `/api/games/create` request. |
