import {Card} from 'common/cards/types'
import {ApiDeck, Deck, Tag} from 'common/types/deck'
import {toLocalCardInstance} from 'common/utils/cards'
import pg from 'pg'
const {Pool} = pg
import {CARDS} from 'common/cards'
import {TypeT} from 'common/types/cards'
import {
	ApiGame,
	CardStats,
	DeckStats,
	GamesStats,
	Stats,
	TypeDistributionStats,
	User,
	UserWithoutSecret,
} from 'common/types/database'
import {GameOutcome} from 'common/types/game-state'
import {NumberOrNull} from 'common/utils/database-codes'

export type DatabaseResult<T = undefined> =
	| {
			type: 'success'
			body: T
	  }
	| {
			type: 'failure'
			reason?: string
	  }

export class Database {
	public pool: pg.Pool
	public allCards: Array<Card>
	public connected: boolean
	private bfDepth: number

	constructor(env: any, allCards: Array<Card>, bfDepth: number) {
		this.pool = new Pool({connectionString: env.DATABASE_URL})
		this.allCards = allCards
		this.bfDepth = bfDepth
		this.connected = false

		this.pool.on('error', (err, _client) => {
			console.error('DB Error Encountered:', err)
		})
	}

	public async new() {
		try {
			await this.pool.query(
				`
				CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
				CREATE EXTENSION IF NOT EXISTS "pgcrypto";
				SET bytea_output = 'hex';
				CREATE TABLE IF NOT EXISTS users(
					user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
					secret varchar(255) NOT NULL,
					username varchar(255) NOT NULL,
					minecraft_name varchar(255)
				);
				CREATE TABLE IF NOT EXISTS decks(
					user_id uuid REFERENCES users(user_id),
					deck_code varchar(7) PRIMARY KEY,
					name varchar(255) NOT NULL,
					icon varchar(255) NOT NULL,
					icon_type varchar(255) NOT NULL,
					exported boolean DEFAULT false NOT NULL,
					show_info boolean DEFAULT false NOT NULL
				);
				CREATE TABLE IF NOT EXISTS games(
					start_time timestamp NOT NULL,
					completion_time timestamp NOT NULL,
					winner uuid REFERENCES users(user_id),
					loser uuid REFERENCES users(user_id),
					winner_deck_code varchar(7) REFERENCES decks(deck_code),
					loser_deck_code varchar(7) REFERENCES decks(deck_code),
					outcome varchar(31) NOT NULL,
					seed varchar(15) NOT NULL,
					turns integer,
					first_player_won boolean,
					replay bytea NOT NULL,
					opponent_code varchar(15)
				);
				CREATE TABLE IF NOT EXISTS cards(
					card_id integer PRIMARY KEY NOT NULL
				);
				CREATE TABLE IF NOT EXISTS deck_cards(
					deck_code varchar(7),
					card_id integer REFERENCES cards(card_id),
					copies integer NOT NULL,
					PRIMARY KEY (deck_code,card_id),
					FOREIGN KEY (deck_code) REFERENCES decks(deck_code) ON DELETE CASCADE
				);
				CREATE TABLE IF NOT EXISTS user_tags(
					user_id uuid REFERENCES users(user_id),
					tag_id varchar(7) PRIMARY KEY,
					tag_name varchar(255) NOT NULL,
					tag_color varchar(7) NOT NULL
				);
				ALTER TABLE user_tags DROP CONSTRAINT IF EXISTS color_hex_constraint;
				ALTER TABLE user_tags ADD CONSTRAINT color_hex_constraint CHECK (tag_color ~* '^#[a-f0-9]{6}$');
				CREATE TABLE IF NOT EXISTS deck_tags(
					deck_code varchar(7) REFERENCES decks(deck_code),
					tag_id varchar(7),
					FOREIGN KEY (tag_id) REFERENCES user_tags(tag_id) ON DELETE CASCADE
				);
				CREATE TABLE IF NOT EXISTS achievements(
					achievement_id varchar(7) PRIMARY KEY NOT NULL,
					achievement_name varchar(255) NOT NULL,
					description varchar(65535) NOT NULL,
					icon varchar(255) NOT NULL,
					total integer NOT NULL 
				);
				CREATE TABLE IF NOT EXISTS user_achievements(
					user_id uuid REFERENCES users(user_id),
					achievement_id varchar(7) REFERENCES achievements(achievement_id),
					progress integer NOT NULL
				);
				`,
			)

			console.log('Database connected')

			await this.pool.query(
				`
				INSERT INTO cards (card_id) SELECT * FROM UNNEST ($1::int[]) ON CONFLICT DO NOTHING;
			`,
				[this.allCards.map((card) => card.numericId)],
			)
			console.log('Database populated')

			this.connected = true
		} catch (e) {
			console.log(e)
			console.info('Running server without database...')
		}
	}

	public async close() {
		await this.pool.end()
	}

	/*** Insert a user into the Database. Returns `user`. */
	public async insertUser(
		username: string,
		minecraftName: string | null,
	): Promise<DatabaseResult<User>> {
		try {
			const secret = (await this.pool.query('SELECT * FROM uuid_generate_v4()'))
				.rows[0]['uuid_generate_v4']
			const user = await this.pool.query(
				"INSERT INTO users (username, minecraft_name, secret) values ($1,$2,crypt($3, gen_salt('bf', $4))) RETURNING (user_id)",
				[username, minecraftName, secret, this.bfDepth],
			)
			return {
				type: 'success',
				body: {
					uuid: user.rows[0]['user_id'],
					secret: secret,
					username: username,
					minecraftName: minecraftName,
				},
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	public async authenticateUser(
		uuid: string,
		secret: string,
	): Promise<DatabaseResult<User>> {
		try {
			const user = await this.pool.query(
				'SELECT * FROM users WHERE user_id = $1 AND secret = crypt($2, secret)',
				[uuid, secret],
			)

			return {
				type: 'success',
				body: {
					uuid: user.rows[0]['user_id'],
					secret: secret,
					username: user.rows[0]['username'],
					minecraftName: user.rows[0]['minecraft_name'],
				},
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/*** Insert a deck into the Database. Returns the deck code. */
	public async insertDeck(
		name: string,
		icon: string,
		iconType: string,
		cards: Array<number>,
		tagIds: Array<string>,
		code: string,
		user_id: string,
	): Promise<DatabaseResult<string>> {
		try {
			await this.pool.query(
				'INSERT INTO decks (user_id, name, icon, icon_type, deck_code) values ($1,$2,$3,$4,$5)',
				[user_id, name, icon, iconType, code],
			)

			const reformattedCards = cards.reduce(
				(r: Array<{id: number; copies: number}>, card) => {
					const index = r.findIndex((subcard) => subcard.id === card)
					if (index >= 0) {
						r[index].copies += 1
						return r
					}
					return [...r, {id: card, copies: 1}]
				},
				[],
			)

			await this.pool.query(
				`
					INSERT INTO deck_cards (deck_code,card_id,copies) SELECT * FROM UNNEST ($1::text[],$2::int[],$3::int[]) 
					ON CONFLICT DO NOTHING`,
				[
					Array(reformattedCards.length).fill(code),
					reformattedCards.map((card) => card.id),
					reformattedCards.map((card) => card.copies),
				],
			)

			if (tagIds.length > 0) {
				await this.pool.query(
					'INSERT INTO deck_tags (deck_code,tag_id) SELECT * FROM UNNEST ($1::text[],$2::text[])',
					[Array(tagIds.length).fill(code), tagIds],
				)
			}

			return {
				type: 'success',
				body: code,
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	public async updateDeck(
		name: string,
		icon: string,
		iconType: string,
		tagIds: Array<string>,
		code: string,
		user_id: string,
	): Promise<DatabaseResult<string>> {
		try {
			await this.pool.query(
				'UPDATE decks SET name = $1, icon = $2, icon_type = $3 WHERE deck_code = $4 AND user_id = $5',
				[name, icon, iconType, code, user_id],
			)

			await this.pool.query('DELETE FROM deck_tags WHERE deck_code = $1', [
				code,
			])

			if (tagIds.length > 0) {
				await this.pool.query(
					'INSERT INTO deck_tags (deck_code,tag_id) SELECT * FROM UNNEST ($1::text[],$2::text[]) ON CONFLICT DO NOTHING',
					[Array(tagIds.length).fill(code), tagIds],
				)
			}

			return {
				type: 'success',
				body: code,
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/** Return the deck with a specific ID, for use in the API. */
	public async getDeckFromID(
		deckCode: string,
	): Promise<DatabaseResult<ApiDeck>> {
		try {
			const deck = (
				await this.pool.query(
					`SELECT
						decks.user_id,decks.deck_code,decks.name,decks.icon,decks.icon_type,decks.show_info,
						deck_cards.card_id,deck_cards.copies,
						user_tags.tag_id,user_tags.tag_name,user_tags.tag_color FROM decks
						LEFT JOIN deck_cards ON decks.deck_code = deck_cards.deck_code
						LEFT JOIN deck_tags ON decks.deck_code = deck_tags.deck_code
						LEFT JOIN user_tags ON deck_tags.tag_id = user_tags.tag_id
						WHERE decks.deck_code = $1
					`,
					[deckCode],
				)
			).rows
			const showAllInfo: boolean = deck[0]['show_info']
			const code = deck[0]['deck_code']
			const name = showAllInfo ? deck[0]['name'] : null
			const icon = showAllInfo ? deck[0]['icon'] : null
			const iconType = showAllInfo ? deck[0]['icon_type'] : null
			const cards: Array<Card> = deck.reduce((r: Array<Card>, row) => {
				if (
					row['card_id'] === null ||
					r.find((card) => card.numericId === row['card_id'])
				)
					return r
				return [
					...r,
					...Array(row['copies']).fill(
						this.allCards.find((card) => card.numericId === row['card_id']),
					),
				]
			}, [])
			const tags: Array<Tag> = deck.reduce((r: Array<Tag>, row) => {
				if (!row['tag_id'] || r.find((tag) => tag.key === row['tag_id']))
					return r
				return [
					...r,
					{name: row['tag_name'], color: row['tag_color'], key: row['tag_id']},
				]
			}, [])

			return {
				type: 'success',
				body: {
					code,
					name,
					icon,
					iconType,
					cards: cards.map((card) => card.id),
					tags,
				},
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/** Return the deck with a specific ID. */
	public async getPlayerDeckFromID(
		deckCode: string,
	): Promise<DatabaseResult<Deck>> {
		try {
			const deck = (
				await this.pool.query(
					`SELECT
						decks.user_id,decks.deck_code,decks.name,decks.icon,decks.icon_type,decks.show_info,
						deck_cards.card_id,deck_cards.copies,
						user_tags.tag_id,user_tags.tag_name,user_tags.tag_color FROM decks
						LEFT JOIN deck_cards ON decks.deck_code = deck_cards.deck_code
						LEFT JOIN deck_tags ON decks.deck_code = deck_tags.deck_code
						LEFT JOIN user_tags ON deck_tags.tag_id = user_tags.tag_id
						WHERE decks.deck_code = $1
					`,
					[deckCode],
				)
			).rows
			const code = deck[0]['deck_code']
			const name = deck[0]['name']
			const icon = deck[0]['icon']
			const iconType = deck[0]['icon_type']
			const showInfo: boolean = deck[0]['show_info']
			const cards: Array<Card> = deck.reduce((r: Array<Card>, row) => {
				if (
					row['card_id'] === null ||
					r.find((card) => card.numericId === row['card_id'])
				)
					return r
				return [
					...r,
					...Array(row['copies']).fill(
						this.allCards.find((card) => card.numericId === row['card_id']),
					),
				]
			}, [])
			const tags: Array<Tag> = deck.reduce((r: Array<Tag>, row) => {
				if (!row['tag_id'] || r.find((tag) => tag.key === row['tag_id']))
					return r
				return [
					...r,
					{name: row['tag_name'], color: row['tag_color'], key: row['tag_id']},
				]
			}, [])

			return {
				type: 'success',
				body: {
					code,
					name,
					icon,
					iconType,
					cards: cards.map((card) => toLocalCardInstance(card)),
					tags,
					public: showInfo,
				},
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/** Return the decks associated with a user. */
	public async getDecks(uuid: string): Promise<DatabaseResult<Array<Deck>>> {
		try {
			const decksResult = (
				await this.pool.query(
					`SELECT 
						decks.user_id,decks.deck_code,decks.name,decks.icon,decks.icon_type,
						deck_cards.card_id,deck_cards.copies,decks.show_info,
						user_tags.tag_id,user_tags.tag_name,user_tags.tag_color FROM decks
						LEFT JOIN deck_cards ON decks.deck_code = deck_cards.deck_code
						LEFT JOIN deck_tags ON decks.deck_code = deck_tags.deck_code
						LEFT JOIN user_tags ON deck_tags.tag_id = user_tags.tag_id
						WHERE decks.user_id = $1
						`,
					[uuid],
				)
			).rows

			const decks = decksResult.reduce((allDecks: Array<Deck>, row) => {
				const code: string = row['deck_code']
				const showInfo: boolean = row['show_info']
				const name: string = row['name']
				const icon: string = row['icon']
				const iconType: string = row['icon_type']
				const tag: Tag = {
					name: row['tag_name'],
					color: row['tag_color'],
					key: row['tag_id'],
				}
				const cardId: number | null = row['card_id']
				const cards: Array<Card> =
					cardId !== null
						? [
								...Array(row['copies']).fill(
									this.allCards.find((card) => card.numericId === cardId),
								),
							]
						: []

				const foundDeck = allDecks.find((deck) => deck.code === code)

				if (!foundDeck) {
					const newDeck: Deck = {
						code,
						name,
						icon,
						public: showInfo,
						//@ts-ignore
						iconType,
						tags: tag.key !== null ? [tag] : [],
						cards:
							cardId !== null
								? cards.map((card) => toLocalCardInstance(card))
								: [],
					}
					return [...allDecks, newDeck]
				}

				if (
					tag &&
					!foundDeck.tags.find((searchTag) => searchTag.key === tag.key) &&
					tag.key !== null
				) {
					foundDeck.tags.push(tag)
				}

				if (
					cardId !== null &&
					foundDeck.cards.find((card) => card.props.numericId !== cardId) &&
					!foundDeck.cards.map((card) => card.props.numericId).includes(cardId)
				) {
					foundDeck.cards = [
						...foundDeck.cards,
						...cards.map((card) => toLocalCardInstance(card)),
					]
				}

				return allDecks
			}, [])

			return {
				type: 'success',
				body: decks,
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/** Delete or disassociate a deck from a user. This is used when a deck is deleted or updated.*/
	public async deleteDeck(
		deckCode: string,
		user_id: string,
	): Promise<DatabaseResult> {
		try {
			const deleteable = (
				await this.pool.query(
					`SELECT exported = 0 AND games_played = 0 as deletable 
					FROM (SELECT count(CASE WHEN exported THEN 1 END) as exported,count(winner_deck_code) + count(loser_deck_code) as games_played FROM decks
					LEFT JOIN games ON games.winner_deck_code = decks.deck_code OR games.loser_deck_code = decks.deck_code
					WHERE decks.deck_code = $1 AND decks.user_id = $2)`,
					[deckCode, user_id],
				)
			).rows[0]['deletable']

			if (deleteable) {
				await this.pool.query('DELETE FROM deck_tags WHERE deck_code = $1', [
					deckCode,
				])
				await this.pool.query('DELETE FROM deck_cards WHERE deck_code = $1', [
					deckCode,
				])
				await this.pool.query(
					'DELETE FROM decks WHERE deck_code = $1 AND user_id = $2',
					[deckCode, user_id],
				)
			} else {
				await this.pool.query(
					'UPDATE decks SET user_id = NULL WHERE deck_code = $1 AND user_id = $2',
					[deckCode, user_id],
				)
			}

			return {type: 'success', body: undefined}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/**Set a deck as exported */
	public async setAsExported(
		deckCode: string,
		user_id: string,
	): Promise<DatabaseResult> {
		try {
			await this.pool.query(
				'UPDATE decks SET exported = TRUE WHERE deck_code = $1 AND user_id = $2',
				[deckCode, user_id],
			)
			return {type: 'success', body: undefined}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	public async setShowData(
		newShowData: boolean,
		deckCode: string,
		user_id: string,
	): Promise<DatabaseResult> {
		try {
			await this.pool.query(
				'UPDATE decks SET show_info = $1 WHERE deck_code = $2 AND user_id = $3',
				[newShowData, deckCode, user_id],
			)
			return {type: 'success', body: undefined}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/*** Insert a tag into the Database. Returns the tag code. */
	public async insertTag(
		uuid: string,
		tagName: string,
		tagColor: string,
		tagId: string,
	): Promise<DatabaseResult<Tag>> {
		try {
			const tag = await this.pool.query(
				'INSERT INTO user_tags (user_id, tag_name, tag_color, tag_id) values ($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING tag_id,tag_name,tag_color',
				[uuid, tagName, tagColor, tagId],
			)

			return {
				type: 'success',
				body: {
					name: tag.rows[0]['tag_name'],
					color: tag.rows[0]['tag_color'],
					key: tag.rows[0]['tag_id'],
				},
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/** Delete a tag from a user. */
	public async deleteTag(uuid: string, tagId: string): Promise<DatabaseResult> {
		try {
			await this.pool.query(
				'DELETE FROM user_tags WHERE user_tags.tag_id = $1 AND user_id = $2',
				[tagId, uuid],
			)
			return {type: 'success', body: undefined}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/**Get tags a user has created */
	public async getTags(uuid: string): Promise<DatabaseResult<Array<Tag>>> {
		try {
			const tags = await this.pool.query(
				'SELECT tag_id,tag_name,tag_color FROM user_tags WHERE user_id = $1',
				[uuid],
			)

			return {
				type: 'success',
				body: tags.rows.map((row) => ({
					name: row['tag_name'],
					color: row['tag_color'],
					key: row['tag_id'],
				})),
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/**Get a user's stats */
	public async getUserStats(uuid: string): Promise<DatabaseResult<Stats>> {
		try {
			const stats = await this.pool.query(
				`
			SELECT 
			(SELECT count(*) FROM games WHERE winner = $1 AND outcome='player_won') as wins,
			(SELECT count(*) FROM games WHERE loser = $1 AND outcome='player_won') as losses,
			(SELECT count(*) FROM games WHERE winner = $1 AND outcome='forfeit') as forfeit_wins,
			(SELECT count(*) FROM games WHERE loser = $1 AND outcome='forfeit') as forfeit_losses,
			(SELECT count(*) FROM games WHERE winner = $1 OR loser = $1) as total,
			(SELECT count(*) FROM games WHERE (winner = $1 OR loser = $1) 
				AND outcome != 'player_won' AND outcome != 'forfeit') as ties
			`,
				[uuid],
			)

			const statRows = stats.rows[0]

			return {
				type: 'success',
				body: {
					gamesPlayed: Number(statRows['total']),
					wins: Number(statRows['wins']),
					losses: Number(statRows['losses']),
					forfeitWins: Number(statRows['forfeit_wins']),
					forfeitLosses: Number(statRows['forfeit_losses']),
					ties: Number(statRows['ties']),
				},
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/**Get a deck's stats */
	public async getDeckStats(code: string): Promise<DatabaseResult<Stats>> {
		try {
			const stats = await this.pool.query(
				`
				SELECT 
				(SELECT count(*) FROM games WHERE winner_deck_code = $1 AND outcome='player_won') as wins,
				(SELECT count(*) FROM games WHERE loser_deck_code = $1 AND outcome='player_won') as losses,
				(SELECT count(*) FROM games WHERE winner_deck_code = $1 AND outcome='forfeit') as forfeit_wins,
				(SELECT count(*) FROM games WHERE loser_deck_code = $1 AND outcome='forfeit') as forfeit_losses,
				(SELECT count(*) FROM games WHERE winner_deck_code = $1 OR loser_deck_code = $1) as total,
				(SELECT count(*) FROM games WHERE (winner_deck_code = $1 OR loser_deck_code = $1) 
					AND outcome != 'player_won' AND outcome != 'forfeit') as ties
				`,
				[code],
			)

			const statRows = stats.rows[0]

			return {
				type: 'success',
				body: {
					gamesPlayed: Number(statRows['total']),
					wins: Number(statRows['wins']),
					losses: Number(statRows['losses']),
					forfeitWins: Number(statRows['forfeit_wins']),
					forfeitLosses: Number(statRows['forfeit_losses']),
					ties: Number(statRows['ties']),
				},
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/** Returns a user's username and minecraft name from their UUID*/
	public async getUserInfo(
		uuid: string,
	): Promise<DatabaseResult<UserWithoutSecret>> {
		try {
			const user = await this.pool.query(
				'SELECT user_id,username,minecraft_name FROM users WHERE user_id = $1',
				[uuid],
			)

			return {
				type: 'success',
				body: {
					uuid: user.rows[0]['user_id'],
					username: user.rows[0]['username'],
					minecraftName: user.rows[0]['minecraft_name'],
				},
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/**Set a user's username */
	public async setUsername(uuid: string, newUsername: string): Promise<void> {
		await this.pool.query('UPDATE users SET username = $1 WHERE user_id = $2', [
			newUsername,
			uuid,
		])
	}

	/**Set a user's minecraft name */
	public async setMinecraftName(
		uuid: string,
		newMinecraftName: string,
	): Promise<DatabaseResult> {
		try {
			await this.pool.query(
				'UPDATE users SET minecraft_name = $1 WHERE user_id = $2',
				[newMinecraftName, uuid],
			)
			return {type: 'success', body: undefined}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/** Insert a game into the database */
	public async insertGame(
		firstPlayerDeckCode: string,
		secondPlayerDeckCode: string,
		firstPlayerUuid: string,
		secondPlayerUuid: string,
		outcome: GameOutcome,
		gameLength: number,
		winningPlayerUuid: string | null,
		seed: string,
		turns: number,
		replay: Buffer,
		opponentCode: string | null,
	): Promise<DatabaseResult> {
		try {
			const replayBytes = replay.reduce((r, c) => (r << 8) & c, 0)
			let winner
			let winningDeck
			let loser
			let losingDeck
			let dbOutcome: 'timeout' | 'forfeit' | 'tie' | 'player_won' | 'error'

			if (outcome.type === 'tie') {
				dbOutcome = 'tie'
			} else if (outcome.type === 'game-crash') {
				dbOutcome = 'error'
			} else if (outcome.type === 'timeout') {
				dbOutcome = 'timeout'
			} else if (outcome.victoryReason === 'forfeit') {
				dbOutcome = 'forfeit'
			} else {
				dbOutcome = 'player_won'
			}

			if (winningPlayerUuid && winningPlayerUuid === firstPlayerUuid) {
				winner = firstPlayerUuid
				winningDeck = firstPlayerDeckCode
				loser = secondPlayerUuid
				losingDeck = secondPlayerDeckCode
			} else {
				winner = secondPlayerUuid
				winningDeck = secondPlayerDeckCode
				loser = firstPlayerUuid
				losingDeck = firstPlayerDeckCode
			}

			const firstPlayerWon = winner === firstPlayerUuid

			await this.pool.query(
				"INSERT INTO games (start_time, completion_time, winner, loser, winner_deck_code, loser_deck_code, outcome, seed, turns, first_player_won, replay, opponent_code) VALUES(CURRENT_TIMESTAMP - $1 * '1 millisecond'::interval,CURRENT_TIMESTAMP,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
				[
					gameLength,
					winner,
					loser,
					winningDeck,
					losingDeck,
					dbOutcome,
					seed,
					turns,
					firstPlayerWon,
					replayBytes,
					opponentCode,
				],
			)
			return {type: 'success', body: undefined}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/**Get the current stats of cards*/
	public async getCardsStats({
		before,
		after,
		orderBy,
	}: {
		before: number | null
		after: number | null
		orderBy:
			| 'winrate'
			| 'deckUsage'
			| 'gameUsage'
			| 'averageCopies'
			| 'averagePlayers'
			| 'encounterChance'
			| 'adjustedWinrate'
			| 'winrateDifference'
			| null
	}): Promise<DatabaseResult<Array<CardStats>>> {
		try {
			const stats = await this.pool.query({
				text: `
				WITH main_result AS (
					SELECT card_id, 
					total_decks, cast(copies as decimal) / NULLIF(included_in_decks,0) as average_copies, 
					cast(included_in_decks as decimal) / total_decks as deck_usage, 
					(cast(wins as decimal) + losses) / total_games as average_players,
					cast(included_in_games as decimal) / total_games as game_usage,
					cast(wins as decimal) / NULLIF(wins + losses,0) as winrate FROM (
						SELECT card_id,
						count(CASE WHEN wins THEN 1 END) as wins,
						count(CASE WHEN losses THEN 1 END) as losses, 
						count(deck_code) as included_in_decks, 
						count(DISTINCT start_time) as included_in_games,
						sum(copies) as copies FROM (
							SELECT cards.card_id,
							deck_cards.deck_code,
							deck_cards.copies,
							games.winner_deck_code = deck_cards.deck_code as wins,
							games.loser_deck_code = deck_cards.deck_code as losses,
							games.start_time
							FROM cards
							LEFT JOIN deck_cards ON cards.card_id = deck_cards.card_id
							INNER JOIN games ON games.winner_deck_code = deck_cards.deck_code OR games.loser_deck_code = deck_cards.deck_code
							WHERE deck_cards.card_id > -1
							AND ($1::bigint IS NULL OR games.completion_time > to_timestamp($1::bigint))
							AND ($2::bigint IS NULL OR games.completion_time <= to_timestamp($2::bigint))
						) as result
					GROUP BY result.card_id)
					CROSS JOIN (SELECT count(*) as total_decks FROM decks)
					CROSS JOIN (SELECT count(*) as total_games FROM games)
					WHERE wins > 0
				),
				adjusted_winrate_table AS (
					SELECT card_id, 
					cast(wins as decimal) / NULLIF(wins + losses,0) as adjusted_winrate FROM (
						SELECT card_id,
						count(CASE WHEN wins THEN 1 END) as wins,
						count(CASE WHEN losses THEN 1 END) as losses
						FROM (
							SELECT cards.card_id,
							games.winner_deck_code = deck_cards.deck_code as wins,
							games.loser_deck_code = deck_cards.deck_code as losses
							FROM cards
							LEFT JOIN deck_cards ON cards.card_id = deck_cards.card_id
							INNER JOIN games ON games.winner_deck_code = deck_cards.deck_code OR games.loser_deck_code = deck_cards.deck_code
							WHERE deck_cards.card_id > -1
							AND ((games.loser_deck_code = deck_cards.deck_code AND NOT EXISTS (
								SELECT card_id FROM deck_cards 
								WHERE deck_code = games.winner_deck_code
								AND deck_cards.card_id = cards.card_id
								LIMIT 1
							))
							OR (games.winner_deck_code = deck_cards.deck_code AND NOT EXISTS (
								SELECT card_id FROM deck_cards 
								WHERE deck_code = games.loser_deck_code
								AND deck_cards.card_id = cards.card_id
								LIMIT 1
							)))
							AND ($1::bigint IS NULL OR games.completion_time > to_timestamp($1::bigint))
							AND ($2::bigint IS NULL OR games.completion_time <= to_timestamp($2::bigint))
						) as result
						GROUP BY result.card_id
					)
					WHERE wins > 0
				)
				SELECT main_result.card_id,
				main_result.winrate,
				adjusted_winrate,
				adjusted_winrate - winrate as winrate_difference,
				deck_usage,
				game_usage,
				average_players,
				average_copies
				FROM main_result
				LEFT JOIN adjusted_winrate_table ON adjusted_winrate_table.card_id = main_result.card_id
				ORDER BY (
					CASE WHEN $3 = 'winrate' THEN winrate 
						WHEN $3 = 'adjustedWinrate' THEN adjusted_winrate 
						WHEN $3 = 'winrateDifference' THEN adjusted_winrate - winrate
						WHEN $3 = 'deckUsage' THEN deck_usage 
						WHEN $3 = 'gameUsage' THEN game_usage 
						WHEN $3 = 'averageCopies' THEN average_copies 
						WHEN $3 = 'averagePlayers' THEN average_players 
						WHEN $3 = 'encounterChance' THEN average_players 
					ELSE winrate END) 
				DESC
					`,
				values: [after, before, orderBy],
				name: 'get-cards-stats',
			})

			return {
				type: 'success',
				body: stats.rows.map((row): CardStats => {
					return {
						id: Number(row['card_id']),
						winrate: row['winrate'] ? Number(row['winrate']) : null,
						adjustedWinrate: row['adjusted_winrate']
							? Number(row['adjusted_winrate'])
							: null,
						winrateDifference: row['winrate_difference']
							? Number(row['winrate_difference'])
							: null,
						deckUsage: row['deck_usage'] ? Number(row['deck_usage']) : 0,
						gameUsage: row['game_usage'] ? Number(row['game_usage']) : 0,
						averagePlayers: row['average_players']
							? Number(row['average_players'])
							: 0,
						encounterChance: row['average_players']
							? Number(row['average_players'] / 2)
							: 0,
						averageCopies: row['average_copies']
							? Number(row['average_copies'])
							: 0,
					}
				}),
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/**Get the current stats of decks */
	public async getDecksStats({
		before,
		after,
		offset,
		orderBy,
		minimumWins,
	}: {
		before: number | null
		after: number | null
		offset: number | null
		orderBy: 'wins' | 'winrate' | null
		minimumWins: number | null
	}): Promise<DatabaseResult<Array<DeckStats>>> {
		const limit = 100
		try {
			const decksResult = (
				await this.pool.query({
					text: `
					WITH statistics AS (
						SELECT deck_code,
						wins, losses, cast(wins as decimal) / NULLIF(wins + losses,0) as winrate FROM (
							SELECT result.deck_code,
								count(CASE WHEN wins THEN 1 END) as wins,
								count(CASE WHEN losses THEN 1 END) as losses
								FROM (
									SELECT decks.deck_code,
									games.winner_deck_code = decks.deck_code as wins,
									games.loser_deck_code = decks.deck_code as losses FROM decks
									INNER JOIN games ON games.winner_deck_code = decks.deck_code OR games.loser_deck_code = decks.deck_code
									WHERE ($1::bigint IS NULL OR games.completion_time > to_timestamp($1::bigint))
									AND ($2::bigint IS NULL OR games.completion_time <= to_timestamp($2::bigint))
								) as result
							GROUP BY result.deck_code) as deck_code_list 
							WHERE wins >= $6::int
							LIMIT $3::int
							OFFSET $3::int * $4::int
					)
					SELECT decks.user_id,decks.deck_code,decks.name,decks.icon,decks.icon_type,
					deck_cards.card_id,deck_cards.copies,wins,losses,winrate
					FROM statistics
                    LEFT JOIN decks on statistics.deck_code = decks.deck_code
                    LEFT JOIN deck_cards ON statistics.deck_code = deck_cards.deck_code
                    ORDER BY (CASE WHEN $5 = 'winrate' THEN cast(wins as decimal) / NULLIF(wins + losses,0) ELSE wins END) DESC
					`,
					values: [
						after,
						before,
						limit,
						offset ? offset : 0,
						orderBy ? orderBy : 'winrate',
						minimumWins !== null ? minimumWins : 50,
					],
					name: 'get-deck-result',
				})
			).rows

			const decks = decksResult.reduce((allDecks: Array<DeckStats>, row) => {
				const code: string = row['deck_code']
				const name: string = row['name']
				const icon: string = row['icon']
				const showInfo: boolean = row['show_info']
				const iconType: string = row['icon_type']
				const cardId: number | null = row['card_id']
				const cards: Array<Card> =
					cardId !== null
						? [
								...Array(row['copies']).fill(
									this.allCards.find((card) => card.numericId === cardId),
								),
							]
						: []

				const winrate: string = row['winrate']
				const wins: string = row['wins']
				const losses: string = row['losses']

				const foundDeck = allDecks.find((deck) => deck.deck.code === code)

				if (!foundDeck) {
					const newDeck: DeckStats = {
						deck: {
							code,
							name: showInfo ? name : null,
							icon,
							iconType,
							tags: [],
							cards: cardId !== null ? cards.map((card) => card.id) : [],
						},
						winrate: winrate ? Number(winrate) : null,
						wins: Number(wins),
						losses: Number(losses),
					}
					return [...allDecks, newDeck]
				}

				if (
					cardId !== null &&
					foundDeck.deck.cards.find(
						(card) => CARDS[card].numericId !== cardId,
					) &&
					!foundDeck.deck.cards
						.map((card) => CARDS[card].numericId)
						.includes(cardId)
				) {
					foundDeck.deck.cards = [
						...foundDeck.deck.cards,
						...cards.map((card) => card.id),
					]
				}

				return allDecks
			}, [])

			return {
				type: 'success',
				body: decks,
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/**Get the type distribution of decks*/
	public async getTypeDistribution({
		before,
		after,
	}: {
		before: number | null
		after: number | null
	}): Promise<DatabaseResult<TypeDistributionStats>> {
		try {
			const stats = await this.pool.query({
				text: `
				WITH deck_winrate_statistics AS (
					SELECT deck_code,
					cast(wins as decimal) / NULLIF(wins + losses,0) as winrate FROM (
						SELECT result.deck_code,
							count(CASE WHEN wins THEN 1 END) as wins,
							count(CASE WHEN losses THEN 1 END) as losses
							FROM (
								SELECT decks.deck_code,
								games.winner_deck_code = decks.deck_code as wins,
								games.loser_deck_code = decks.deck_code as losses FROM decks
								INNER JOIN games ON games.winner_deck_code = decks.deck_code OR games.loser_deck_code = decks.deck_code
								WHERE ($1::bigint IS NULL OR games.completion_time > to_timestamp($1::bigint))
								AND ($2::bigint IS NULL OR games.completion_time <= to_timestamp($2::bigint))
							) as result
						GROUP BY result.deck_code) as deck_code_list 
				),
				types_wins_and_losses as (
							WITH decks_with_types AS (
								SELECT decks.deck_code,sum(2 ^ ((deck_cards.card_id - 49) / 2)) as type_code FROM decks 
								JOIN deck_cards ON decks.deck_code = deck_cards.deck_code AND deck_cards.card_id IN (49,51,53,55,57,59,61,63,65,67)
								GROUP BY decks.deck_code
							),
							games_with_types AS (
								SELECT winner_deck_code,loser_deck_code,winner.type_code as winner_type_code,loser.type_code as loser_type_code
								FROM games
								JOIN deck_winrate_statistics ON deck_winrate_statistics.deck_code = games.winner_deck_code
								JOIN (SELECT * FROM decks_with_types) as winner ON games.winner_deck_code = winner.deck_code
								JOIN (SELECT * FROM decks_with_types) as loser ON games.loser_deck_code = loser.deck_code AND winner.type_code != loser.type_code
								WHERE winrate > 0.05 AND winrate < 0.95
								AND ($1::bigint IS NULL OR games.completion_time > to_timestamp($1::bigint))
								AND ($2::bigint IS NULL OR games.completion_time <= to_timestamp($2::bigint))
							)
							SELECT winner_type_code,loser_type_code,sum(wins) as wins,max(losses) as losses FROM (
								SELECT win_amounts.winner_type_code,win_amounts.loser_type_code,
								wins,(CASE WHEN losses is NULL THEN 0 ELSE losses END) as losses FROM (
									SELECT winner_type_code,loser_type_code,count(*) as wins FROM games_with_types
									GROUP BY winner_type_code,loser_type_code
								) AS win_amounts
								LEFT JOIN (
									SELECT loser_type_code,winner_type_code,count(*) as losses FROM games_with_types
									GROUP BY loser_type_code,winner_type_code
								) AS loss_amounts ON loss_amounts.loser_type_code = win_amounts.winner_type_code AND win_amounts.loser_type_code = loss_amounts.winner_type_code
								UNION ALL (
									SELECT extra_losses.loser_type_code,extra_losses.winner_type_code,
									0,extra_losses.losses FROM (
										SELECT winner_type_code,loser_type_code,count(*) as losses FROM games_with_types
										GROUP BY winner_type_code,loser_type_code
									) AS extra_losses
								)
							) GROUP BY (winner_type_code,loser_type_code)
						)
				SELECT
					*,
					cast(multi_type_wins + multi_type_losses as decimal) / (multi_type_wins + multi_type_losses + mono_type_wins + mono_type_losses) as multi_type_frequency,
					cast(multi_type_wins as decimal) / (multi_type_wins + multi_type_losses) as multi_type_winrate,
					cast(mono_type_wins + mono_type_losses as decimal) / (multi_type_wins + multi_type_losses + mono_type_wins + mono_type_losses) as mono_type_frequency,
					cast(mono_type_wins as decimal) / (mono_type_wins + mono_type_losses) as mono_type_winrate
					FROM (
						SELECT 
						winner_type_code as type_code,
						cast(sum(wins) + sum(losses) as decimal) / (SELECT sum(wins) + sum(losses) FROM types_wins_and_losses) as frequency,
						cast(sum(wins) as decimal) / NULLIF(sum(wins) + sum(losses), 0) as winrate,
						cast(sum(CASE WHEN loser_type_code = 1 THEN wins ELSE 0 END) as decimal) / NULLIF(sum(CASE WHEN loser_type_code = 1 THEN wins ELSE 0 END) + sum(CASE WHEN loser_type_code = 1 THEN losses ELSE 0 END), 0) as winrate_against_balanced,
						cast(sum(CASE WHEN loser_type_code = 2 THEN wins ELSE 0 END) as decimal) / NULLIF(sum(CASE WHEN loser_type_code = 2 THEN wins ELSE 0 END) + sum(CASE WHEN loser_type_code = 2 THEN losses ELSE 0 END), 0) as winrate_against_builder,
						cast(sum(CASE WHEN loser_type_code = 4 THEN wins ELSE 0 END) as decimal) / NULLIF(sum(CASE WHEN loser_type_code = 4 THEN wins ELSE 0 END) + sum(CASE WHEN loser_type_code = 4 THEN losses ELSE 0 END), 0) as winrate_against_explorer,
						cast(sum(CASE WHEN loser_type_code = 8 THEN wins ELSE 0 END) as decimal) / NULLIF(sum(CASE WHEN loser_type_code = 8 THEN wins ELSE 0 END) + sum(CASE WHEN loser_type_code = 8 THEN losses ELSE 0 END), 0) as winrate_against_farm,
						cast(sum(CASE WHEN loser_type_code = 16 THEN wins ELSE 0 END) as decimal) / NULLIF(sum(CASE WHEN loser_type_code = 16 THEN wins ELSE 0 END) + sum(CASE WHEN loser_type_code = 16 THEN losses ELSE 0 END), 0) as winrate_against_miner,
						cast(sum(CASE WHEN loser_type_code = 32 THEN wins ELSE 0 END) as decimal) / NULLIF(sum(CASE WHEN loser_type_code = 32 THEN wins ELSE 0 END) + sum(CASE WHEN loser_type_code = 32 THEN losses ELSE 0 END), 0) as winrate_against_prankster,
						cast(sum(CASE WHEN loser_type_code = 64 THEN wins ELSE 0 END) as decimal) / NULLIF(sum(CASE WHEN loser_type_code = 64 THEN wins ELSE 0 END) + sum(CASE WHEN loser_type_code = 64 THEN losses ELSE 0 END), 0) as winrate_against_pvp,
						cast(sum(CASE WHEN loser_type_code = 128 THEN wins ELSE 0 END) as decimal) / NULLIF(sum(CASE WHEN loser_type_code = 128 THEN wins ELSE 0 END) + sum(CASE WHEN loser_type_code = 128 THEN losses ELSE 0 END), 0) as winrate_against_redstone,
						cast(sum(CASE WHEN loser_type_code = 256 THEN wins ELSE 0 END) as decimal) / NULLIF(sum(CASE WHEN loser_type_code = 256 THEN wins ELSE 0 END) + sum(CASE WHEN loser_type_code = 256 THEN losses ELSE 0 END), 0) as winrate_against_speedrunner,
						cast(sum(CASE WHEN loser_type_code = 512 THEN wins ELSE 0 END) as decimal) / NULLIF(sum(CASE WHEN loser_type_code = 512 THEN wins ELSE 0 END) + sum(CASE WHEN loser_type_code = 512 THEN losses ELSE 0 END), 0) as winrate_against_terraform
						FROM types_wins_and_losses
						GROUP BY winner_type_code
						ORDER BY winner_type_code
					)
				CROSS JOIN (SELECT sum(CASE WHEN winner_type_code NOT IN (1,2,4,8,16,32,64,128,256,512) THEN wins ELSE 0 END) as multi_type_wins FROM types_wins_and_losses)
				CROSS JOIN (SELECT sum(CASE WHEN loser_type_code NOT IN (1,2,4,8,16,32,64,128,256,512) THEN wins ELSE 0 END) as multi_type_losses FROM types_wins_and_losses)
				CROSS JOIN (SELECT sum(CASE WHEN winner_type_code IN (1,2,4,8,16,32,64,128,256,512) THEN wins ELSE 0 END) as mono_type_wins FROM types_wins_and_losses)
				CROSS JOIN (SELECT sum(CASE WHEN loser_type_code IN (1,2,4,8,16,32,64,128,256,512) THEN wins ELSE 0 END) as mono_type_losses FROM types_wins_and_losses)
				WHERE frequency > 0.005
				`,
				values: [after, before],
				name: 'get-type-distribution',
			})

			const info = stats.rows

			const getTypeArray = (typeCode: number) => {
				const types: Array<TypeT> = []
				if ((typeCode & 0b0000000001) !== 0) types.push('balanced')
				if ((typeCode & 0b0000000010) !== 0) types.push('builder')
				if ((typeCode & 0b0000000100) !== 0) types.push('explorer')
				if ((typeCode & 0b0000001000) !== 0) types.push('farm')
				if ((typeCode & 0b0000010000) !== 0) types.push('miner')
				if ((typeCode & 0b0000100000) !== 0) types.push('prankster')
				if ((typeCode & 0b0001000000) !== 0) types.push('pvp')
				if ((typeCode & 0b0010000000) !== 0) types.push('redstone')
				if ((typeCode & 0b0100000000) !== 0) types.push('speedrunner')
				if ((typeCode & 0b1000000000) !== 0) types.push('terraform')

				return types
			}

			const types = info.map((row) => {
				const typeCode: number | null = row['type_code']
				const winrate = Number(row['winrate'])
				const frequency = Number(row['frequency'])

				const typeMatchups = {
					balanced: NumberOrNull(row['winrate_against_balanced']),
					builder: NumberOrNull(row['winrate_against_builder']),
					explorer: NumberOrNull(row['winrate_against_explorer']),
					farm: NumberOrNull(row['winrate_against_farm']),
					miner: NumberOrNull(row['winrate_against_miner']),
					prankster: NumberOrNull(row['winrate_against_prankster']),
					pvp: NumberOrNull(row['winrate_against_pvp']),
					redstone: NumberOrNull(row['winrate_against_redstone']),
					speedrunner: NumberOrNull(row['winrate_against_speedrunner']),
					terraform: NumberOrNull(row['winrate_against_terraform']),
				}

				if (typeCode === null) {
					return {
						type: ['typeless'],
						winrate,
						frequency,
						typeMatchups,
					}
				}

				return {
					type: getTypeArray(typeCode),
					winrate,
					frequency,
					typeMatchups,
				}
			})

			return {
				type: 'success',
				body: {
					multiTypeFrequency: Number(info[0]['multi_type_frequency']),
					monoTypeWinrate: Number(info[0]['mono_type_winrate']),
					multiTypeWinrate: Number(info[0]['multi_type_winrate']),
					types: types,
				} as TypeDistributionStats,
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/**Get the current stats of */
	public async getGamesStats({
		before,
		after,
	}: {before: number | null; after: number | null}): Promise<
		DatabaseResult<GamesStats>
	> {
		try {
			const stats = await this.pool.query(
				`WITH selection AS (
					SELECT 
						count(*) as amount,
						avg(completion_time - start_time) as average_length,
						sqrt(sum(
							(
								extract(epoch FROM completion_time - start_time -
								(SELECT avg(completion_time - start_time) FROM games))
							) ^ 2
							) / ((SELECT count(*) FROM games) - 1)) * '1 second'::interval as standard_deviation,
						cast(count(CASE WHEN outcome = 'tie' THEN 1 END) as decimal) / count(*) as tie_rate,
						cast(count(CASE WHEN outcome = 'forfeit' THEN 1 END) as decimal) / count(*) as forfeit_rate,
						cast(count(CASE WHEN 
							outcome != 'player_won' AND 
							outcome != 'forfeit' AND 
							outcome != 'tie' THEN 1 END
						) as decimal) / count(*) as error_rate
					FROM games
					WHERE ($1::bigint IS NULL OR games.completion_time > to_timestamp($1::bigint))
					AND ($2::bigint IS NULL OR games.completion_time <= to_timestamp($2::bigint))
				)
				SELECT * FROM selection
				CROSS JOIN (
					SELECT (completion_time - start_time) as median_length FROM games 
					ORDER BY (completion_time - start_time) LIMIT 1
					OFFSET (SELECT count(*) FROM games) / 2
				) CROSS JOIN (
					SELECT (completion_time - start_time) as first_quartile FROM games 
					ORDER BY (completion_time - start_time) LIMIT 1
					OFFSET (SELECT count(*) FROM games) / 4
				) CROSS JOIN (
					SELECT (completion_time - start_time) as third_quartile FROM games 
					ORDER BY (completion_time - start_time) DESC LIMIT 1
					OFFSET (SELECT count(*) FROM games) / 4
				) CROSS JOIN (
					SELECT (completion_time - start_time) as minimum FROM games 
					ORDER BY (completion_time - start_time) LIMIT 1
					OFFSET (SELECT count(*) FROM games) / 20
				) CROSS JOIN (
					SELECT (completion_time - start_time) as maximum FROM games 
					ORDER BY (completion_time - start_time) DESC LIMIT 1
					OFFSET (SELECT count(*) FROM games) / 20
				)`,
				[after, before],
			)

			return {
				type: 'success',
				body: {
					games: Number(stats.rows[0]['amount']),
					tieRate: Number(stats.rows[0]['tie_rate']),
					forfeitRate: Number(stats.rows[0]['forfeit_rate']),
					errorRate: Number(stats.rows[0]['error_rate']),
					gameLength: {
						averageLength: stats.rows[0]['average_length'],
						medianLength: stats.rows[0]['median_length'],
						standardDeviation: stats.rows[0]['standard_deviation'],
						firstQuartile: stats.rows[0]['first_quartile'],
						thirdQuartile: stats.rows[0]['third_quartile'],
						minimum: stats.rows[0]['minimum'],
						maximum: stats.rows[0]['maximum'],
					},
				},
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/**Get the current stats of */
	public async getGame({
		opponentCode,
	}: {opponentCode: string}): Promise<DatabaseResult<ApiGame>> {
		try {
			const game = await this.pool.query(
				'SELECT * FROM games LEFT JOIN users ON games.winner = users.user_id OR games.loser = users.user_id WHERE opponent_code = $1',
				[opponentCode],
			)

			const winner: string = game.rows[0]['username']
			const loser: string = game.rows[1]['username']
			const startTime: number = game.rows[0]['start_time']

			const firstPlayerWon: boolean = game.rows[0]['first_player_won']
			const tie: boolean = game.rows[0]['outcome'] === 'tie'

			const firstPlayer = firstPlayerWon ? winner : loser
			const secondPlayer = firstPlayerWon ? loser : winner

			return {
				type: 'success',
				body: {
					firstPlayerName: firstPlayer,
					secondPlayerName: secondPlayer,
					startTime: startTime,
					winner: tie ? null : winner,
				},
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}
}
