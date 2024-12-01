# Hermitcraft TCG API Documentation

-   `GET /api/cards`

Returns a list of all cards.

---

-   `GET /api/types`

Returns a list of all card types and resources for them.

---

-   `GET /api/ranks`

Returns a list of all card ranks and resources for them.

---

-   `GET /api/deck/{deckCode}`

Get the deck for a deck code or hash from previous versions of HC TCG.

-   `POST /api/deck/cost`

Request Body: `Array<hermit id as string>`

Returns the cost of a deck containing the listed cards.

---

-   `GET /api/games/count`

Get the amount of public games currently active.

-   `GET /api/games/queue/length`

Get the amount of players waiting in the public queue.

-   `GET /api/games/create`

Creates a new game and returns the codes to join it. The game code will time out after five minutes.

| Field           |  Type  |                                        Description |
| :-------------- | :----: | -------------------------------------------------: |
| `gameCode`      | string |                 Code players use to join the game. |
| `spectatorCode` | string |              Code spectators use to join the game. |
| `apiSecret`     | string | Code used to cancel games made with the HC-TCG API |
| `timeOutAt`     |  int   |   Time when the game code will no longer be valid. |

-   `DELETE /api/games/cancel`

Cancel a game made with the HC-TCG API.

Request Body:
| Field | Type | Description |
| :----------- | :--------------: | -------------------------: |
| `code` | string | The API secret returned with the `/api/games/create` request. |

-   `GET /api/games/{secret}`

Get information about a game using its api secret.

| Field           |        Type         |                               Description |
| :-------------- | :-----------------: | ----------------------------------------: |
| `id`            |       string        |                  Games unique identifier. |
| `createdTime`   |         int         |                Time the game was created. |
| `spectatorCode` |       string        |           Code to spectate the game with. |
| `players`       | Array&lt;Player&gt; |      Array of player objects (see below). |
| `viewers`       |         int         | The total number of spectators & players. |
| `state`         |       string        |        Code players use to join the game. |

**Player:**
| Field | Type | Description |
| :----------- | :--------------: | -------------------------: |
| `playerName` | string | Players display name |
| `censoredPlayerName` | string | Censored version of `playerName` |
| `minecraftName` | string | Name of the displayed minecraft head |
| `lives` | int | Lives remaining |
| `deck` | int | Array of card text ids in the players deck |

### Stats Endpoints

-   `GET /api/stats?uuid=...`

Get the stats for a specific user's UUID.

**Query Parameters**
| Query | Type | Description |
| :----: | :--: | :------------------------------------------: |
| `uuid` | uuid | The uuid of the user to fetch the stats for. |

-   `POST /api/stats/cards`

Returns an array of all cards with a numeric ID equal to or above 0. Each entry includes:

-   `id` The card's ID.
-   `winrate` Winrate.
-   `deckUsage` Percentage of decks it's included in.
-   `gameUsage` Percentage of games that either player uses the card.
-   `averagePlayers` The average number of players that use the card in each game.
-   `encounterChance` The chance of playing a game where your opponent uses the card.
-   `averageCopies` Average copies of a card in decks that it's included in.

**Query Parameters**
| Query | Type | Description |
| :-------: | :--------------------------------------------------------: | :-------------------------------------------------------------: |
| `before` | unix timestamp | Limits search to all games that happened before this timestamp. |
| `after` | unix timestamp | Limits search to all games that happened after this timestamp. |
| `orderBy` | 'winrate' \| 'deckUsage' \| 'gameUsage' \| 'averageCopies' \| 'averagePlayers' \| 'encounterChance' | How to order the returned data. |

-   `POST /api/stats/decks`

Returns the 20 top scoring decks that match the specified parameters. Each deck is returned with the deck, `wins`, `winrate`, and `losses`.

**Query Parameters**
| Query | Type | Description |
| :-----------: | :-----------------: | :-----------------------------------------------------------------: |
| `before` | unix timestamp | Limits search to all games that happened before this timestamp. |
| `after` | unix timestamp | Limits search to all games that happened after this timestamp. |
| `orderBy` | 'wins' \| 'winrate' | How to order the returned data. |
| `offset` | number | Returns decks at the offset location. |
| `minimumWins` | int | The minimum wins needed for the deck to be returned. Default is 50. |

**Query Parameters**

-   `POST api/stats/type-distribution`

Returns information for types. To make the analysis more accurate, this endpoint does not include decks with a winrate below 0.05% or above 0.95% in the data in analyzes.

-   `multiTypeFrequency` The percent of decks that are not mono type. This stat also includes deck with no types.
-   `monoTypeWinrate` The percent of games where a player used a mono type deck that the deck won.
-   `multiTypeWinrate` The percent of games where a player used a non-mono type deck that the deck won.

In addition, an array is also returned with all type combinations that appear in above 1% of games. Each entry includes this information:

-   `type` The name of the types used in the combination. Decks are considered a type if they have an item card of that type in the deck.
-   `frequency` The percentage of decks that were played in games that include an item card of this type.
-   `winrate` The average winrate of the aforementioned decks.
-   `typeMatchups` The winrate against each mono-type matchup.

**Query Parameters**
| Query | Type | Description |
| :------: | :------------: | :-------------------------------------------------------------: |
| `before` | unix timestamp | Limits search to all games that happened before this timestamp. |
| `after` | unix timestamp | Limits search to all games that happened after this timestamp. |

-   `POST api/stats/games`

Returns information about the total games played.

-   `games` The amount of games played after 1.0.
-   `allTimeGames` The amount of games ever played, even before 1.0. These games are not included in any other statistics.
-   `tieRate` The percentage of games that have ended in ties.
-   `forfeit` The percentage of games that have ended in forfeits.
-   `errorRate` The percentage of games that have ended in server errors.

The following information is found within `gameLength`.

-   `averageLength` The average length of games.
-   `medianLength` The median length of games.
-   `standardDeviation` The size of a standard deviation.
-   `minimum` The shortest game, discarding the bottom 5%.
-   `maximum` The longest game, discarding the top 5%.

**Query Parameters**
| Query | Type | Description |
| :------: | :------------: | :-------------------------------------------------------------: |
| `before` | unix timestamp | Limits search to all games that happened before this timestamp. |
| `after` | unix timestamp | Limits search to all games that happened after this timestamp. |
