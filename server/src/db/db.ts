import {Card} from 'common/cards/types'
import {ApiDeck, Deck, Tag} from 'common/types/deck'
import {GameEndOutcomeT} from 'common/types/game-state'
import {toLocalCardInstance} from 'common/utils/cards'
import pg from 'pg'
const {Pool} = pg
import {
	CardStats,
	DeckStats,
	GamesStats,
	Stats,
	TypeDistributionStats,
	User,
	UserWithoutSecret,
} from 'common/types/database'

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

	constructor(pool: pg.Pool, allCards: Array<Card>, bfDepth: number) {
		this.pool = pool
		this.allCards = allCards
		this.bfDepth = bfDepth
		this.connected = false
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
					replay bytea NOT NULL
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

	/** Return the deck with a specific ID. */
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
					cards: cards.map((card) => toLocalCardInstance(card)),
					tags,
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
		outcome: GameEndOutcomeT,
		gameLength: number,
		winningPlayerUuid: string | null,
		seed: string,
		replay: Buffer,
	): Promise<DatabaseResult> {
		try {
			const replayBytes = replay.reduce((r, c) => (r << 8) & c, 0)
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
					replayBytes,
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
		orderBy: 'winrate' | 'deckUsage' | 'gameUsage' | 'averageCopies' | null
	}): Promise<DatabaseResult<Array<CardStats>>> {
		try {
			const stats = await this.pool.query(
				`
				SELECT card_id, 
				total_decks, cast(copies as decimal) / NULLIF(included_in_decks,0) as average_copies, 
				cast(included_in_decks as decimal) / total_decks as deck_usage, 
				(cast(wins as decimal) + losses) / total_games as game_usage,
				cast(wins as decimal) / NULLIF(wins + losses,0) as winrate FROM (
					SELECT card_id,count(CASE WHEN wins THEN 1 END) as wins,
					count(CASE WHEN losses THEN 1 END) as losses, 
					count(deck_code) as included_in_decks, 
					sum(copies) as copies FROM (
						SELECT cards.card_id,
						deck_cards.deck_code,
						deck_cards.copies,
						games.winner_deck_code = deck_cards.deck_code as wins,
						games.loser_deck_code = deck_cards.deck_code as losses FROM cards
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
				ORDER BY (
					CASE WHEN $3 = 'winrate' THEN winrate 
						WHEN $3 = 'deckUsage' THEN deck_usage 
						WHEN $3 = 'gameUsage' THEN game_usage 
						WHEN $3 = 'averageCopies' THEN average_copies 
					ELSE winrate END) 
				DESC
					`,
				[after, before, orderBy],
			)

			return {
				type: 'success',
				body: stats.rows.map((row): CardStats => {
					return {
						id: Number(row['card_id']),
						winrate: row['winrate'] ? Number(row['winrate']) : null,
						deck_usage: row['deck_usage'] ? Number(row['deck_usage']) : 0,
						game_usage: row['game_usage'] ? Number(row['game_usage']) : 0,
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
		const limit = 20
		try {
			const decksResult = (
				await this.pool.query(
					`
					SELECT decks.user_id,decks.deck_code,decks.name,decks.icon,decks.icon_type,
					deck_cards.card_id,deck_cards.copies,
					deck_code_list.deck_code, wins, losses, cast(wins as decimal) / NULLIF(wins + losses,0) as winrate FROM (
						SELECT 
						deck_code,
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
					LEFT JOIN decks on deck_code_list.deck_code = decks.deck_code
					LEFT JOIN deck_cards ON decks.deck_code = deck_cards.deck_code
					WHERE wins >= $6::int
					ORDER BY (CASE WHEN $5 = 'winrate' THEN cast(wins as decimal) / NULLIF(wins + losses,0) ELSE wins END) DESC
					LIMIT $3::int
					OFFSET $3::int * $4::int
					`,
					[
						after,
						before,
						limit,
						offset ? offset : 0,
						orderBy ? orderBy : 'winrate',
						minimumWins !== null ? minimumWins : 50,
					],
				)
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
							cards:
								cardId !== null
									? cards.map((card) => toLocalCardInstance(card))
									: [],
						},
						winrate: winrate ? Number(winrate) : null,
						wins: Number(wins),
						lossses: Number(losses),
					}
					return [...allDecks, newDeck]
				}

				if (
					cardId !== null &&
					foundDeck.deck.cards.find(
						(card) => card.props.numericId !== cardId,
					) &&
					!foundDeck.deck.cards
						.map((card) => card.props.numericId)
						.includes(cardId)
				) {
					foundDeck.deck.cards = [
						...foundDeck.deck.cards,
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

	/**Get the type distribution of decks*/
	public async getTypeDistribution({
		before,
		after,
	}: {
		before: number | null
		after: number | null
	}): Promise<DatabaseResult<TypeDistributionStats>> {
		try {
			const stats = await this.pool.query(
				`
				SELECT
				cast(balanced_a as decimal) / total_amount as balanced_usage,
				cast(builder_a as decimal) / total_amount as builder_usage,
				cast(explorer_a as decimal) / total_amount as explorer_usage,
				cast(farm_a as decimal) / total_amount as farm_usage,
				cast(miner_a as decimal) / total_amount as miner_usage,
				cast(prankster_a as decimal) / total_amount as prankster_usage,
				cast(pvp_a as decimal) / total_amount as pvp_usage,
				cast(redstone_a as decimal) / total_amount as redstone_usage,
				cast(speedrunner_a as decimal) / total_amount as speedrunner_usage,
				cast(terraform_a as decimal) / total_amount as terraform_usage,
				cast(balanced_w as decimal) / NULLIF(balanced_w + balanced_l,0) as balanced_winrate,
				cast(builder_w as decimal) / NULLIF(builder_w + builder_l,0) as builder_winrate,
				cast(explorer_w as decimal) / NULLIF(explorer_w + explorer_l,0) as explorer_winrate,
				cast(farm_w as decimal) / NULLIF(farm_w + farm_l,0) as farm_winrate,
				cast(miner_w as decimal) / NULLIF(miner_w + miner_l,0) as miner_winrate,
				cast(prankster_w as decimal) / NULLIF(prankster_w + prankster_l,0) as prankster_winrate,
				cast(pvp_w as decimal) / NULLIF(pvp_w + pvp_l,0) as pvp_winrate,
				cast(redstone_w as decimal) / NULLIF(redstone_w + balanced_l,0) as redstone_winrate,
				cast(speedrunner_w as decimal) / NULLIF(speedrunner_w + speedrunner_l,0) as speedrunner_winrate,
				cast(terraform_w as decimal) / NULLIF(terraform_w + terraform_l,0) as terraform_winrate
				FROM (SELECT 
						count(CASE WHEN card_id = 49 OR card_id = 50 THEN 1 END) as balanced_a,
						count(CASE WHEN card_id = 51 OR card_id = 52 THEN 1 END) as builder_a,
						count(CASE WHEN card_id = 53 OR card_id = 54 THEN 1 END) as explorer_a,
						count(CASE WHEN card_id = 55 OR card_id = 56 THEN 1 END) as farm_a,
						count(CASE WHEN card_id = 57 OR card_id = 58 THEN 1 END) as miner_a,
						count(CASE WHEN card_id = 59 OR card_id = 60 THEN 1 END) as prankster_a,
						count(CASE WHEN card_id = 61 OR card_id = 62 THEN 1 END) as pvp_a,
						count(CASE WHEN card_id = 63 OR card_id = 64 THEN 1 END) as redstone_a,
						count(CASE WHEN card_id = 65 OR card_id = 66 THEN 1 END) as speedrunner_a,
						count(CASE WHEN card_id = 67 OR card_id = 68 THEN 1 END) as terraform_a,
						count(CASE WHEN win AND card_id = 49 OR card_id = 50 THEN 1 END) as balanced_w,
						count(CASE WHEN win AND card_id = 51 OR card_id = 52 THEN 1 END) as builder_w,
						count(CASE WHEN win AND card_id = 53 OR card_id = 54 THEN 1 END) as explorer_w,
						count(CASE WHEN win AND card_id = 55 OR card_id = 56 THEN 1 END) as farm_w,
						count(CASE WHEN win AND card_id = 57 OR card_id = 58 THEN 1 END) as miner_w,
						count(CASE WHEN win AND card_id = 59 OR card_id = 60 THEN 1 END) as prankster_w,
						count(CASE WHEN win AND card_id = 61 OR card_id = 62 THEN 1 END) as pvp_w,
						count(CASE WHEN win AND card_id = 63 OR card_id = 64 THEN 1 END) as redstone_w,
						count(CASE WHEN win AND card_id = 65 OR card_id = 66 THEN 1 END) as speedrunner_w,
						count(CASE WHEN win AND card_id = 67 OR card_id = 68 THEN 1 END) as terraform_w,
						count(CASE WHEN loss AND card_id = 49 OR card_id = 50 THEN 1 END) as balanced_l,
						count(CASE WHEN loss AND card_id = 51 OR card_id = 52 THEN 1 END) as builder_l,
						count(CASE WHEN loss AND card_id = 53 OR card_id = 54 THEN 1 END) as explorer_l,
						count(CASE WHEN loss AND card_id = 55 OR card_id = 56 THEN 1 END) as farm_l,
						count(CASE WHEN loss AND card_id = 57 OR card_id = 58 THEN 1 END) as miner_l,
						count(CASE WHEN loss AND card_id = 59 OR card_id = 60 THEN 1 END) as prankster_l,
						count(CASE WHEN loss AND card_id = 61 OR card_id = 62 THEN 1 END) as pvp_l,
						count(CASE WHEN loss AND card_id = 63 OR card_id = 64 THEN 1 END) as redstone_l,
						count(CASE WHEN loss AND card_id = 65 OR card_id = 66 THEN 1 END) as speedrunner_l,
						count(CASE WHEN loss AND card_id = 67 OR card_id = 68 THEN 1 END) as terraform_l,
						count(card_id) as total_amount
						FROM (
							SELECT deck_cards.card_id,
							games.winner_deck_code = decks.deck_code as win,
							games.loser_deck_code = decks.deck_code as loss
							FROM decks
							LEFT JOIN deck_cards ON deck_cards.deck_code = decks.deck_code
							INNER JOIN games ON games.winner_deck_code = decks.deck_code OR games.loser_deck_code = decks.deck_code
							WHERE deck_cards.card_id >= 49 AND deck_cards.card_id <= 68
                            AND (games.winner_deck_code = decks.deck_code OR games.loser_deck_code = decks.deck_code)
							AND ($1::bigint IS NULL OR games.completion_time > to_timestamp($1::bigint))
							AND ($2::bigint IS NULL OR games.completion_time <= to_timestamp($2::bigint))
						)
					)
						`,
				[after, before],
			)

			const info = stats.rows[0]

			return {
				type: 'success',
				body: [
					{
						type: 'balanced',
						usage: Number(info['balanced_usage']),
						winrate: Number(info['balanced_winrate']),
					},
					{
						type: 'builder',
						usage: Number(info['builder_usage']),
						winrate: Number(info['builder_winrate']),
					},
					{
						type: 'explorer',
						usage: Number(info['explorer_usage']),
						winrate: Number(info['explorer_winrate']),
					},
					{
						type: 'farm',
						usage: Number(info['farm_usage']),
						winrate: Number(info['farm_winrate']),
					},
					{
						type: 'miner',
						usage: Number(info['miner_usage']),
						winrate: Number(info['miner_winrate']),
					},
					{
						type: 'prankster',
						usage: Number(info['prankster_usage']),
						winrate: Number(info['prankster_winrate']),
					},
					{
						type: 'pvp',
						usage: Number(info['pvp_usage']),
						winrate: Number(info['pvp_winrate']),
					},
					{
						type: 'redstone',
						usage: Number(info['redstone_usage']),
						winrate: Number(info['redstone_winrate']),
					},
					{
						type: 'speedrunner',
						usage: Number(info['speedrunner_usage']),
						winrate: Number(info['speedrunner_winrate']),
					},
					{
						type: 'terraform',
						usage: Number(info['terraform_usage']),
						winrate: Number(info['terraform_winrate']),
					},
				],
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
				`SELECT count(*) as amount,avg(completion_time - start_time) as average_length FROM games
				WHERE ($1::bigint IS NULL OR games.completion_time > to_timestamp($1::bigint))
				AND ($2::bigint IS NULL OR games.completion_time <= to_timestamp($2::bigint))`,
				[after, before],
			)

			return {
				type: 'success',
				body: {
					amount: Number(stats.rows[0]['amount']),
					averageLength: stats.rows[0]['average_length'],
				},
			}
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
		connectionString: env.DATABASE_URL,
		max: 10,
		idleTimeoutMillis: 0,
		connectionTimeoutMillis: 2000,
	})

	return new Database(pool, allCards, bfDepth)
}
