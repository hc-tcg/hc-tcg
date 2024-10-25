import pg from 'pg'
import {Card} from 'common/cards/base/types'
import {GameEndOutcomeT} from 'common/types/game-state'
import {Tag} from 'common/types/deck'
const {Pool} = pg
import {Deck, User, UserWithoutSecret, Stats} from 'common/types/database'

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
	private bfDepth: number

	constructor(pool: pg.Pool, allCards: Array<Card>, bfDepth: number) {
		this.pool = pool
		this.allCards = allCards
		this.bfDepth = bfDepth
	}

	public async new() {
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
				deck_code varchar(7) PRIMARY KEY DEFAULT substr(digest(random()::text, 'sha1')::text, 3, 7),
				previous_code varchar(7) REFERENCES decks(deck_code),
				name varchar(255) NOT NULL,
				icon varchar(255) NOT NULL
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
				replay bytea NOT NULL
			);
			CREATE TABLE IF NOT EXISTS cards(
				card_id integer PRIMARY KEY NOT NULL
			);
			CREATE TABLE IF NOT EXISTS deck_cards(
				deck_code varchar(7) REFERENCES decks(deck_code),
				card_id integer REFERENCES cards(card_id),
				copies integer NOT NULL,
				PRIMARY KEY (deck_code,card_id)
			);
			CREATE TABLE IF NOT EXISTS user_tags(
				user_id uuid,
				tag_id varchar(7) PRIMARY KEY DEFAULT substr(digest(random()::text, 'sha1')::text, 3, 7),
				tag_name varchar(255) NOT NULL,
				tag_color varchar(7) NOT NULL,
				FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
			);
			ALTER TABLE user_tags DROP CONSTRAINT IF EXISTS color_hex_constraint;
			ALTER TABLE user_tags ADD CONSTRAINT color_hex_constraint CHECK (tag_color ~* '^#[a-f0-9]{6}$');
			CREATE TABLE IF NOT EXISTS deck_tags(
				deck_code varchar(7) REFERENCES decks(deck_code),
				tag_id varchar(7) REFERENCES user_tags(tag_id)
			);
			CREATE TABLE IF NOT EXISTS titles(
				title_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
				name varchar(255) NOT NULL,
				icon varchar(255) NOT NULL
			);
			CREATE TABLE IF NOT EXISTS user_titles(
				user_id uuid REFERENCES users(user_id),
				title_id uuid REFERENCES titles(title_id)
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
		cards: Array<number>,
		tagIds: Array<string>,
		user_id: string,
	): Promise<DatabaseResult<string>> {
		try {
			const deckResult = await this.pool.query(
				'INSERT INTO decks (user_id, name, icon) values ($1,$2,$3) RETURNING (deck_code)',
				[user_id, name, icon],
			)
			const deckCode: string = deckResult.rows[0]['deck_code']

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
					Array(reformattedCards.length).fill(deckCode),
					reformattedCards.map((card) => card.id),
					reformattedCards.map((card) => card.copies),
				],
			)

			if (tagIds.length > 0) {
				await this.pool.query(
					'INSERT INTO deck_tags (deck_code,tag_id) SELECT * FROM UNNEST ($1::text[],$2::text[])',
					[Array(tagIds.length).fill(deckCode), tagIds],
				)
			}

			return {
				type: 'success',
				body: deckCode,
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/** Return the deck with a specific ID. */
	public async getDeckFromID(deckCode: string): Promise<DatabaseResult<Deck>> {
		try {
			const deck = (
				await this.pool.query(
					`SELECT * FROM decks
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
			const cards: Array<Card> = deck.reduce((r: Array<Card>, row) => {
				if (r.find((card) => card.numericId === row['card_id'])) return r
				return [
					...r,
					...Array(row['copies']).fill(
						this.allCards.find((card) => card.numericId === row['card_id']),
					),
				]
			}, [])
			const tags: Array<Tag> = deck.reduce((r: Array<Tag>, row) => {
				if (r.find((tag) => tag.key === row['tag_id'])) return r
				return [
					...r,
					{name: row['tag_name'], color: row['tag_color'], key: row['tag_id']},
				]
			}, [])

			return {
				type: 'success',
				body: {code, name, icon, cards, tags},
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
					`SELECT decks.user_id,decks.deck_code,decks.previous_code,decks.name,decks.icon,
						deck_cards.card_id,deck_cards.copies,
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
				const name: string = row['name']
				const icon: string = row['icon']
				const tag: Tag = {
					name: row['tag_name'],
					color: row['tag_color'],
					key: row['tag_id'],
				}
				const cardId: number | null = row['card_id']
				const cards: Array<Card> = [
					...Array(row['copies']).fill(
						this.allCards.find((card) => card.numericId === cardId),
					),
				]

				const foundDeck = allDecks.find((deck) => deck.code === code)

				if (!foundDeck) {
					const newDeck: Deck = {
						code,
						name,
						icon,
						tags: tag.key !== null ? [tag] : [],
						cards: cardId !== null ? cards : [],
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

				if (foundDeck.cards.find((card) => card.numericId !== cardId)) {
					foundDeck.cards = [...foundDeck.cards, ...cards]
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

	/** Disassociate a deck from a user. This is used when a deck is deleted or updated.*/
	public async disassociateDeck(
		deckCode: string,
		user_id: string,
	): Promise<DatabaseResult> {
		try {
			await this.pool.query(
				'UPDATE decks SET user_id = NULL WHERE deck_code = $1 AND user_id = $2',
				[deckCode, user_id],
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
	): Promise<DatabaseResult<Tag>> {
		try {
			const tag = await this.pool.query(
				'INSERT INTO user_tags (user_id, tag_name, tag_color) values ($1,$2,$3) RETURNING tag_id,tag_name,tag_color',
				[uuid, tagName, tagColor],
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
		outcome: GameEndOutcomeT,
		gameLength: number,
		winningPlayerUuid: string | null,
		seed: string,
		replay: Buffer,
	): Promise<DatabaseResult> {
		try {
			let winner
			let winningDeck
			let loser
			let losingDeck

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

			await this.pool.query(
				"INSERT INTO games (start_time, completion_time, winner, loser, winner_deck_code, loser_deck_code, outcome, seed, replay) VALUES(CURRENT_TIMESTAMP - $1 * '1 millisecond'::interval,CURRENT_TIMESTAMP,$2,$3,$4,$5,$6,$7,$8)",
				[
					gameLength,
					winner,
					loser,
					winningDeck,
					losingDeck,
					outcome,
					seed,
					replay,
				],
			)
			return {type: 'success', body: undefined}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}
}

export const setupDatabase = (
	allCards: Array<Card>,
	env: any,
	bfDepth: number,
) => {
	const pool = new Pool({
		host: env.POSTGRES_HOST,
		user: env.POSTGRES_USER,
		password: env.POSTGRES_PASSWORD,
		database: env.POSTGRES_DATABASE,
		max: 10,
		idleTimeoutMillis: 0,
		connectionTimeoutMillis: 2000,
	})

	return new Database(pool, allCards, bfDepth)
}
