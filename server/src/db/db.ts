import {Achievement} from 'common/achievements/types'
import {Card} from 'common/cards/types'
import {ApiDeck, Deck, Tag} from 'common/types/deck'
import {toLocalCardInstance} from 'common/utils/cards'
import pg from 'pg'
const {Pool} = pg
import assert from 'assert'
import {ACHIEVEMENTS} from 'common/achievements'
import {CARDS} from 'common/cards'
import {getStarterPack} from 'common/cards/starter-decks'
import {CONFIG} from 'common/config'
import {defaultAppearance} from 'common/cosmetics/default'
import {PlayerSetupDefs} from 'common/game/setup-game'
import {AchievementProgress, EarnedAchievement} from 'common/types/achievements'
import {TypeT} from 'common/types/cards'
import {
	AchievementData,
	ApiGame,
	CardStats,
	DeckStats,
	GameHistory,
	GameHistoryPlayer,
	GamesStats,
	PlayerStats,
	Stats,
	TypeDistributionStats,
	User,
	UserWithoutSecret,
} from 'common/types/database'
import {GameOutcome, Message} from 'common/types/game-state'
import {NumberOrNull, generateDatabaseCode} from 'common/utils/database-codes'
import {newRandomNumberGenerator} from 'common/utils/random'
import {huffmanCompress, huffmanDecompress} from '../../src/utils/compression'
import {
	ReplayActionData,
	TurnActionCompressor,
} from '../routines/turn-action-compressor'

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
	public allAchievements: Array<Achievement>
	public connected: boolean
	private bfDepth: number

	constructor(
		env: any,
		allCards: Array<Card>,
		allAchievements: Array<Achievement>,
		bfDepth: number,
	) {
		this.pool = new Pool({connectionString: env.DATABASE_URL})
		this.allCards = allCards
		this.allAchievements = allAchievements
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
				CREATE TABLE IF NOT EXISTS api_keys(
					key varchar(255) NOT NULL,
					name varchar(255) NOT NULL
				);
				CREATE TABLE IF NOT EXISTS users(
					user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
					secret varchar(255) NOT NULL,
					username varchar(255) NOT NULL,
					minecraft_name varchar(255),
					title varchar(255),
					coin varchar(255),
					heart varchar(255),
					background varchar(255),
					border varchar(255),
					banned boolean DEFAULT false NOT NULL
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
					game_id serial PRIMARY KEY,
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
					achievement_id integer PRIMARY KEY NOT NULL
				);
				CREATE TABLE IF NOT EXISTS user_goals(
					user_id uuid REFERENCES users(user_id),
					achievement_id integer REFERENCES achievements(achievement_id),
					goal_id integer,
					progress integer NOT NULL,
					PRIMARY KEY (user_id, achievement_id, goal_id)
				);
				CREATE TABLE IF NOT EXISTS achievement_completion_time(
					user_id uuid REFERENCES users(user_id),
					achievement_id integer REFERENCES achievements(achievement_id),
					level integer NOT NULL,
					completion_time timestamp NOT NULL,
					PRIMARY KEY (user_id, achievement_id, level)
				)
				`,
			)

			console.log('Database connected')

			await this.pool.query(
				`
				INSERT INTO cards (card_id) SELECT * FROM UNNEST ($1::int[]) ON CONFLICT DO NOTHING;
			`,
				[this.allCards.map((card) => card.numericId)],
			)
			await this.pool.query(
				`
				INSERT INTO achievements (achievement_id) SELECT * FROM UNNEST ($1::int[]) ON CONFLICT DO NOTHING;
			`,
				[this.allAchievements.map((achievement) => achievement.numericId)],
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

	public async authenticateApiKey(
		key: string,
	): Promise<DatabaseResult<boolean>> {
		const found = await this.pool.query(
			'SELECT * FROM api_keys WHERE key = crypt($1, key)',
			[key],
		)
		return {type: 'success', body: !!found.rowCount}
	}

	/*** Insert a user into the Database. Returns `user`. */
	public async insertUser(username: string): Promise<DatabaseResult<User>> {
		try {
			const secret = (await this.pool.query('SELECT * FROM uuid_generate_v4()'))
				.rows[0]['uuid_generate_v4']

			const user = await this.pool.query(
				"INSERT INTO users (username, minecraft_name, secret) VALUES ($1,$1,crypt($2, gen_salt('bf', $3))) RETURNING (user_id)",
				[username, secret, this.bfDepth],
			)

			const playerUuid: string = user.rows[0]['user_id']

			const starterPack = getStarterPack()

			const deckInfo = {
				name: 'Starter Deck',
				iconType: 'item',
				icon: starterPack.icon,
				cards: starterPack.cards.map((card) => toLocalCardInstance(card)),
				code: generateDatabaseCode(),
				tags: [],
				public: false,
			}

			await this.insertDeck(
				deckInfo.name,
				deckInfo.icon,
				deckInfo.iconType,
				deckInfo.cards.map((card) => card.id),
				deckInfo.tags,
				deckInfo.code,
				playerUuid,
			)

			return {
				type: 'success',
				body: {
					uuid: playerUuid,
					secret: secret,
					username: username,
					minecraftName: username,
					title: null,
					coin: null,
					heart: null,
					background: null,
					border: null,
					stats: {
						gamesPlayed: 0,
						wins: 0,
						losses: 0,
						forfeitWins: 0,
						forfeitLosses: 0,
						ties: 0,
						topCards: [],
						uniquePlayersEncountered: 0,
						playtime: {
							hours: 0,
							minutes: 0,
							seconds: 0,
						},
					},
					//@ts-ignore
					decks: [deckInfo],
					achievements: {achievementData: {}},
					gameHistory: [],
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
			const uuidExists = await this.pool.query(
				'SELECT * FROM users WHERE user_id = $1',
				[uuid],
			)

			if (uuidExists.rowCount === 0) {
				return {
					type: 'failure',
					reason: 'The UUID given does not exist.',
				}
			}

			const user = await this.pool.query(
				'SELECT * FROM users WHERE user_id = $1 AND secret = crypt($2, secret)',
				[uuid, secret],
			)

			const playerUuid = user.rows[0]['user_id']

			assert(playerUuid, 'The player UUID should be defined.')

			const decks = await this.getDecksFromUuid(playerUuid)
			const achievements = await this.getAchievements(playerUuid)
			const stats = await this.getUserStats(playerUuid)
			const gameHistory = await this.getUserGameHistory(playerUuid)

			assert(
				decks.type === 'success',
				'If the UUID is defined, retrieving decks should not fail.',
			)
			assert(
				achievements.type === 'success',
				'If the UUID is defined, retrieving achievements should not fail.',
			)
			assert(
				stats.type === 'success',
				'If the UUID is defined, retrieving stats should not fail.',
			)
			assert(
				gameHistory.type === 'success',
				'If the UUID is defined, game history should not fail.',
			)

			return {
				type: 'success',
				body: {
					uuid: user.rows[0]['user_id'],
					secret: secret,
					username: user.rows[0]['username'],
					minecraftName: user.rows[0]['minecraft_name'],
					title: user.rows[0]['title'],
					coin: user.rows[0]['coin'],
					heart: user.rows[0]['heart'],
					background: user.rows[0]['background'],
					border: user.rows[0]['border'],
					decks: decks.body,
					achievements: achievements.body,
					stats: stats.body,
					gameHistory: gameHistory.body,
					banned: user.rows[0]['banned'],
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

	/**Get decks from result */
	private async getDecksFromResult(
		decksResult: Array<any>,
	): Promise<DatabaseResult<Array<Deck>>> {
		try {
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
					foundDeck.cards.find((card) => card.id !== cardId) &&
					!foundDeck.cards.map((card) => card.id).includes(cardId)
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

	/** Return the decks associated with a user. */
	public async getDecksFromUuid(
		uuid: string,
	): Promise<DatabaseResult<Array<Deck>>> {
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

			return this.getDecksFromResult(decksResult)
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/** Return the decks with any number of codes. */
	public async getDecksFromCodes(
		codes: Array<string>,
	): Promise<DatabaseResult<Array<Deck>>> {
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
						WHERE decks.deck_code IN (SELECT * FROM UNNEST ($1::text[]))
						`,
					[codes],
				)
			).rows

			return this.getDecksFromResult(decksResult)
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
	public async getUserStats(
		uuid: string,
	): Promise<DatabaseResult<PlayerStats>> {
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
				AND outcome != 'player_won' AND outcome != 'forfeit') as ties,
			(SELECT count(*) FROM (
				SELECT DISTINCT winner as opponent FROM games WHERE loser = $1
				UNION SELECT DISTINCT loser as opponent FROM games WHERE winner = $1
				GROUP BY opponent
			)) as unique_players,
			(SELECT sum(games.completion_time - games.start_time) FROM games 
				WHERE winner = $1
				OR loser = $1
			) as playtime
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
					topCards: [],
					playtime: statRows['playtime']
						? {
								hours: statRows['playtime'].hours || 0,
								minutes: statRows['playtime'].minutes || 0,
								seconds: statRows['playtime'].seconds || 0,
							}
						: {hours: 0, minutes: 0, seconds: 0},
					uniquePlayersEncountered: Number(statRows['unique_players']),
				},
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/**Get a user's game history */
	public async getUserGameHistory(
		uuid: string,
	): Promise<DatabaseResult<Array<GameHistory>>> {
		try {
			const gamesResult: any = await this.pool.query(
				`
				WITH games AS (
					SELECT 
					start_time,
					completion_time - start_time as length,
					turns,
					game_id,
					replay,
					CASE WHEN winner = $1 THEN winner ELSE loser END as you,
					CASE WHEN winner = $1 THEN loser ELSE winner END as opponent,
					CASE WHEN winner = $1 THEN winner_deck_code ELSE loser_deck_code END as deck_code,
					first_player_won,
					outcome,
					winner,
					seed
					FROM games WHERE winner = $1 OR loser = $1
				)
				SELECT game_id,start_time,your_username,opponent_username,your_minecraft_name,opponent_minecraft_name,you,opponent,
				outcome,winner,decks.deck_code,copies,card_id,name,icon,icon_type,replay,first_player_won,length,turns,seed
				FROM games
				JOIN (SELECT user_id, username as your_username, minecraft_name as your_minecraft_name FROM users) as users_y ON games.you = users_y.user_id
				JOIN (SELECT user_id, username as opponent_username, minecraft_name as opponent_minecraft_name FROM users) as users_o ON games.opponent = users_o.user_id
				JOIN decks ON decks.deck_code = games.deck_code
				JOIN deck_cards ON games.deck_code = deck_cards.deck_code
				`,
				[uuid],
			)

			type GameRow = {
				game_id: number
				start_time: Date
				length: {minutes: number; seconds: number; milliseconds: number}
				turns: number | null
				deck_code: string
				your_username: string
				opponent_username: string
				your_minecraft_name: string
				opponent_minecraft_name: string
				you: string
				opponent: string
				first_player_won: boolean
				winner: string
				cards: Array<number>
				name: string
				icon: string
				icon_type: string
				replay: Buffer
				seed: string
			}

			const gamesRows: Array<GameRow> = gamesResult.rows.reduce(
				(r: Array<GameRow>, row: any) => {
					const includedRow = r.find(
						(subrow) => subrow['game_id'] === row['game_id'],
					)
					if (includedRow) {
						includedRow.cards.push(...Array(row['copies']).fill(row['card_id']))
						return r
					}
					r.push({
						game_id: row['game_id'],
						start_time: row['start_time'],
						length: row['length'],
						turns: row['turns'],
						deck_code: row['deck_code'],
						your_username: row['your_username'],
						opponent_username: row['opponent_username'],
						your_minecraft_name: row['your_minecraft_name'],
						opponent_minecraft_name: row['opponent_minecraft_name'],
						you: row['you'],
						opponent: row['opponent'],
						first_player_won: row['first_player_won'],
						winner: row['winner'],
						cards: Array(row['copies']).fill(row['card_id']),
						name: row['name'],
						icon: row['icon'],
						icon_type: row['icon_type'],
						replay: row['replay'],
						seed: row['seed'],
					})
					return r
				},
				[],
			)

			const gamesHistory: Array<GameHistory> = []

			for (let i = 0; i < gamesRows.length; i++) {
				const game = gamesRows[i]

				const replay: Buffer = game.replay
				let hasReplay = false

				if (game.start_time.getTime() < 1741384800000) continue

				if (replay.length >= 4) {
					const decompressedReplay = huffmanDecompress(replay)
					if (
						decompressedReplay &&
						decompressedReplay.readUInt8(0) === CONFIG.game.replayVersion
					) {
						hasReplay = true
					}
				}

				const rng = newRandomNumberGenerator(game.seed)
				const youAreFirst =
					rng() < 0.5 !== ((game.winner === game.you) !== game.first_player_won)

				const yourInfo: GameHistoryPlayer = {
					player: 'you',
					uuid: game.you,
					name: game.your_username,
					minecraftName: game.your_minecraft_name,
				}

				const opponentInfo: GameHistoryPlayer = {
					player: 'opponent',
					uuid: game.opponent,
					name: game.opponent_username,
					minecraftName: game.opponent_minecraft_name,
				}

				gamesHistory.push({
					firstPlayer: youAreFirst ? yourInfo : opponentInfo,
					secondPlayer: youAreFirst ? opponentInfo : yourInfo,
					id: game.game_id,
					hasReplay: hasReplay,
					winner: game.winner,
					startTime: game.start_time,
					length: {
						minutes: game.length.minutes || 0,
						seconds: game.length.seconds || 0,
						milliseconds: game.length.milliseconds || 0,
					},
					turns: game.turns,
					usedDeck: {
						name: game.name,
						icon: game.icon,
						//@ts-ignore
						iconType: game.icon_type,
						cards: game.cards.map((card) => toLocalCardInstance(CARDS[card])),
						code: game.deck_code,
						tags: [],
					},
				})
			}

			gamesHistory.sort((a, b) => {
				return b.startTime.getTime() - a.startTime.getTime()
			})

			return {
				type: 'success',
				body: gamesHistory,
			}
		} catch (e) {
			return {type: 'failure', reason: `${e}`}
		}
	}

	/**Get the replay information of a game */
	public async getGameReplay(gameId: number): Promise<
		DatabaseResult<{
			player1Defs: PlayerSetupDefs
			player2Defs: PlayerSetupDefs
			seed: string
			replay: Array<ReplayActionData>
			battleLog: Array<Message>
		}>
	> {
		try {
			const gamesResult: any = await this.pool.query(
				`
				WITH game AS (
					SELECT * FROM games
					WHERE game_id = $1
				)
				SELECT 
					winner as user_id, winner_deck_code as selected_deck_code, username, minecraft_name,
					card_id, copies, replay, seed, first_player_won = TRUE as first, first_player_won
					FROM game 
					JOIN users ON users.user_id = winner
					LEFT JOIN deck_cards ON deck_cards.deck_code = winner_deck_code
				UNION (
					SELECT 
					loser as user_id, loser_deck_code as selected_deck_code, username, minecraft_name,
					card_id, copies, replay, seed, first_player_won = FALSE as first, first_player_won
					FROM game 
					JOIN users ON users.user_id = loser
					LEFT JOIN deck_cards ON deck_cards.deck_code = loser_deck_code
				)
					`,
				[gameId],
			)

			const rows: Array<Record<string, any>> = gamesResult.rows
			const game: Record<string, any> = rows[0]
			const seed: string = game['seed']

			const replay: Buffer = game['replay']
			const decompressedReplay: Buffer | null = huffmanDecompress(replay)

			console.log(decompressedReplay)

			if (
				!decompressedReplay ||
				decompressedReplay.length < 2 ||
				decompressedReplay.readUintBE(0, 1) !== CONFIG.game.replayVersion
			) {
				return {type: 'failure', reason: 'The game requested has no replay.'}
			}

			const firstPlayerRows = rows.filter((row) => row.first)
			const secondPlayerRows = rows.filter((row) => !row.first)

			const player1Deck: Array<number> = firstPlayerRows.reduce(
				(r: Array<number>, row: any) => {
					const newElements = Array(row['copies']).fill(
						this.allCards.find((card) => card.numericId === row['card_id'])
							?.numericId,
					)
					if (newElements.includes(undefined)) return r
					r.push(...newElements)
					return r
				},
				[],
			)

			const player2Deck: Array<number> = secondPlayerRows.reduce(
				(r: Array<number>, row: any) => {
					const newElements = Array(row['copies']).fill(
						this.allCards.find((card) => card.numericId === row['card_id'])
							?.numericId,
					)
					if (newElements.includes(undefined)) return r
					r.push(...newElements)
					return r
				},
				[],
			)

			const player1Defs: PlayerSetupDefs & {uuid: string} = {
				model: {
					uuid: firstPlayerRows[0].user_id,
					name: firstPlayerRows[0].username,
					minecraftName: firstPlayerRows[0].minecraft_name,
					censoredName: firstPlayerRows[0].username,
					appearance: defaultAppearance,
				},
				deck: player1Deck.sort((a, b) => a - b),
				uuid: firstPlayerRows[0].user_id,
				score: 0,
			}

			const player2Defs: PlayerSetupDefs & {uuid: string} = {
				model: {
					uuid: secondPlayerRows[0].user_id,
					name: secondPlayerRows[0].username,
					minecraftName: secondPlayerRows[0].minecraft_name,
					censoredName: secondPlayerRows[0].username,
					appearance: defaultAppearance,
				},
				deck: player2Deck.sort((a, b) => a - b),
				uuid: secondPlayerRows[0].user_id,
				score: 0,
			}

			const turnActionCompressor = new TurnActionCompressor()

			const replayActions = await turnActionCompressor.bufferToTurnActions(
				player1Defs,
				player2Defs,
				seed,
				{},
				decompressedReplay,
				gameId.toString(),
			)

			if (replayActions.invalid) {
				return {
					type: 'failure',
					reason: `There was a problem decoding the replay of game ${gameId}.'`,
				}
			}

			return {
				type: 'success',
				body: {
					player1Defs: player1Defs,
					player2Defs: player2Defs,
					replay: replayActions.replay,
					seed,
					battleLog: replayActions.battleLog,
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
		replay: Buffer | null,
		opponentCode: string | null,
	): Promise<DatabaseResult> {
		try {
			let winner
			let winningDeck
			let loser
			let losingDeck
			let firstPlayerWon
			let dbOutcome: 'timeout' | 'forfeit' | 'tie' | 'player_won' | 'error'

			if (outcome.type === 'tie') {
				dbOutcome = 'tie'
			} else if (outcome.type === 'no-viewers') {
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
				firstPlayerWon = true
			} else {
				winner = secondPlayerUuid
				winningDeck = secondPlayerDeckCode
				loser = firstPlayerUuid
				losingDeck = firstPlayerDeckCode
				firstPlayerWon = false
			}

			const compressedReplay = replay
				? huffmanCompress(replay)
				: Buffer.from([0x00])

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
					compressedReplay,
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
						count(DISTINCT deck_code) as included_in_decks, 
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

			const rng = newRandomNumberGenerator(game.rows[0]['seed'])
			const randomNumber = rng()

			const firstPlayer =
				randomNumber >= 0.5 !== firstPlayerWon ? winner : loser
			const secondPlayer =
				randomNumber >= 0.5 !== firstPlayerWon ? loser : winner

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

	/**Get player achievements */
	public async getAchievements(
		playerId: string,
	): Promise<DatabaseResult<AchievementData>> {
		console.log(`GETTING ACHIVEMENTS FOR ${playerId}`)
		try {
			const result = await this.pool.query(
				`
				SELECT user_goals.achievement_id, user_goals.goal_id, user_goals.progress, achievement_completion_time.level, achievement_completion_time.completion_time
				FROM user_goals
				LEFT JOIN achievement_completion_time
				ON user_goals.user_id = achievement_completion_time.user_id AND user_goals.achievement_id = achievement_completion_time.achievement_id
				WHERE user_goals.user_id = $1;
				`,
				[playerId],
			)

			const progress: AchievementProgress = {}
			result.rows.forEach((row) => {
				let achievement = ACHIEVEMENTS[row['achievement_id']]
				if (!achievement) return

				if (progress[row['achievement_id']] === undefined) {
					progress[row['achievement_id']] = {
						goals: {},
						levels: Array(achievement.levels.length)
							.fill(0)
							.map(() => {
								return {}
							}),
					}
				}
				progress[row['achievement_id']].goals[row['goal_id']] = row['progress']

				if (row['level'] !== null) {
					progress[row['achievement_id']].levels[row['level']] = {
						completionTime: row['completion_time'],
					}
				}

				// If we add a new level of an achievement the user may have the goal complete but will not have the achievement.
				// This code grants the user the level for the achievement the first time they log in after said update.
				for (const [i, level] of achievement.levels.entries()) {
					if (
						row['progress'] > level.steps &&
						progress[row['achievement_id']].levels[row['level']]
							?.completionTime === undefined
					) {
						progress[row['achievement_id']].levels[i].completionTime = new Date(
							Date.now(),
						)
					}
				}
			})

			return {
				type: 'success',
				body: {
					achievementData: progress,
				},
			}
		} catch (e) {
			console.log(e)
			return {
				type: 'failure',
				reason: `${e}`,
			}
		}
	}

	/**Update player achievements with their progress */
	public async updateAchievements(
		uuid: string,
		achievementProgress: AchievementProgress,
		gameEndTime: Date,
	): Promise<
		DatabaseResult<{
			newAchievements: Array<EarnedAchievement>
			newProgress: AchievementProgress
		}>
	> {
		try {
			type GoalRow = {
				achievment: number
				goal: number
				progress: number
			}
			const goals: GoalRow[] = Object.keys(achievementProgress).flatMap(
				(achievement_id) => {
					const achievement = this.allAchievements.find(
						(achievement) =>
							achievement.numericId.toString() === achievement_id,
					)
					if (!achievement) return []
					const progress = achievementProgress[achievement.numericId]
					const achievementGoals: GoalRow[] = []
					Object.keys(progress.goals).forEach((goal_id) => {
						const goal_id_number = parseInt(goal_id)
						if (
							Object.values(achievementGoals).find(
								(goal) => goal.goal === goal_id_number,
							)
						)
							return
						if (Number.isNaN(goal_id_number)) return
						achievementGoals.push({
							achievment: achievement.numericId,
							goal: goal_id_number,
							progress:
								progress.goals[goal_id_number] &&
								Math.max(progress.goals[goal_id_number], 0),
						})
					})
					return achievementGoals
				},
			)
			const goalProgress = await this.pool.query(
				`
				WITH args AS (
					SELECT * FROM UNNEST ($1::text[], $2::uuid[], $3::int[], $4::int[], $5::int[]) 
									AS t(method, user_id, achievement_id, goal_id, progress)
				),
				original_goals AS (
					SELECT * FROM user_goals
				)
				INSERT INTO user_goals (user_id, achievement_id, goal_id, progress) SELECT user_id, achievement_id, goal_id, progress FROM args
				ON CONFLICT (user_id, achievement_id, goal_id) DO UPDATE
				SET progress = CASE (SELECT method FROM args WHERE args.achievement_id = user_goals.achievement_id LIMIT 1)
					WHEN 'sum' THEN user_goals.progress + EXCLUDED.progress
					WHEN 'best' THEN greatest(user_goals.progress, EXCLUDED.progress)
					ELSE user_goals.progress
				END
				RETURNING 
					user_goals.achievement_id, 
					user_goals.goal_id, 
					user_goals.progress, 
					coalesce((SELECT progress FROM original_goals WHERE 
						original_goals.achievement_id = user_goals.achievement_id 
						AND original_goals.goal_id = user_goals.goal_id
						AND original_goals.user_id = user_goals.user_id
					), 0) as old_progress;
				`,
				[
					goals.map((row) => {
						const progressionMethod =
							ACHIEVEMENTS[row.achievment].progressionMethod
						assert(
							['best', 'sum'].includes(progressionMethod),
							`Unknown progression method found: \`${progressionMethod}\``,
						)
						return progressionMethod
					}),
					goals.map(() => uuid),
					goals.map((row) => row.achievment),
					goals.map((row) => row.goal),
					goals.map((row) => row.progress),
				],
			)

			type CompletionTimeRow = {
				achievement: number
				level: number
				completion_time: Date
			}

			type AchievementGoals = {
				achievement: number
				goals: Record<number, number>
				oldGoals: Record<number, number>
			}

			const achievementGoalProgress: AchievementProgress = {}

			const achievementGoals: AchievementGoals[] = goalProgress.rows.reduce(
				(r: Array<AchievementGoals>, row) => {
					const achievementId: number = row['achievement_id']
					const goalId: number = row['goal_id']
					const updatedProgress: number = row['progress']
					const oldProgress: number = row['old_progress']
					const goalEntry = r.find((a) => a.achievement === achievementId)

					if (goalEntry) {
						goalEntry.goals[goalId] = updatedProgress
						goalEntry.oldGoals[goalId] = oldProgress
					} else {
						const goals: Record<number, number> = {}
						const oldGoals: Record<number, number> = {}
						goals[goalId] = updatedProgress
						oldGoals[goalId] = oldProgress
						r.push({achievement: achievementId, goals, oldGoals})
					}

					if (!achievementGoalProgress[achievementId]) {
						achievementGoalProgress[achievementId] = {goals: {}, levels: []}
					}
					achievementGoalProgress[achievementId].goals[goalId] = updatedProgress

					return r
				},
				[],
			)

			const earnedAchievements: Array<EarnedAchievement> = []

			const completion: CompletionTimeRow[] = achievementGoals.flatMap((a) => {
				const achievement = this.allAchievements.find(
					(achievement) => achievement.numericId === a.achievement,
				)

				const newProgress = achievement?.getProgress(a.goals)
				const oldProgress = achievement?.getProgress(a.oldGoals)
				if (!achievement || !newProgress) return []
				const completionTime: CompletionTimeRow[] = []
				for (const [i, level] of achievement.levels.entries()) {
					if (
						!oldProgress ||
						(newProgress > oldProgress &&
							newProgress <= level.steps &&
							(i === 0 || achievement.levels[i - 1].steps < newProgress))
					) {
						earnedAchievements.push({
							achievementId: achievement.numericId,
							level: {index: i, ...level},
							originalProgress: oldProgress || 0,
							newProgress: newProgress,
						})
					}

					if (
						newProgress < level.steps ||
						(oldProgress && oldProgress >= level.steps)
					)
						continue
					completionTime.push({
						achievement: achievement.numericId,
						level: i,
						completion_time: gameEndTime,
					})
					achievementGoalProgress[achievement.numericId].levels[i] = {
						completionTime: gameEndTime,
					}
				}
				return completionTime
			})

			await this.pool.query(
				`
			    INSERT INTO achievement_completion_time (user_id, achievement_id, level, completion_time)
				(SELECT * FROM UNNEST ($1::uuid[], $2::int[], $3::int[], $4::timestamp[]))
				ON CONFLICT (user_id, achievement_id, level) DO NOTHING;
			     `,
				[
					completion.map(() => uuid),
					completion.map((row) => row.achievement),
					completion.map((row) => row.level),
					completion.map((row) => row.completion_time),
				],
			)

			return {
				type: 'success',
				body: {
					newAchievements: earnedAchievements,
					newProgress: achievementProgress,
				},
			}
		} catch (e) {
			console.log(e)
			return {
				type: 'failure',
				reason: `${e}`,
			}
		}
	}

	public async setAppearance(
		playerId: string,
		appearance: {
			title: string | null
			coin: string | null
			heart: string | null
			background: string | null
			border: string | null
		},
	): Promise<DatabaseResult> {
		try {
			await this.pool.query(
				`
				UPDATE users
				SET
					title = $2,
					coin = $3,
					heart = $4,
					background = $5,
					border = $6
				WHERE user_id = $1
				`,
				[
					playerId,
					appearance.title,
					appearance.coin,
					appearance.heart,
					appearance.background,
					appearance.border,
				],
			)
			return {
				type: 'success',
				body: undefined,
			}
		} catch (e) {
			console.log(e)
			return {
				type: 'failure',
				reason: `${e}`,
			}
		}
	}

	public async getPlayerAchievementProgress(
		achievement: Achievement,
		player: string,
	): Promise<DatabaseResult<{progress: number}>> {
		try {
			const result = await this.pool.query(
				`
				SELECT user_goals.achievement_id, user_goals.goal_id, user_goals.progress
				FROM user_goals
				WHERE user_goals.achievement_id = $1 AND user_goals.user_id = $2;
				`,
				[achievement.numericId, player],
			)
			const goals = result.rows.reduce((goalRecord, row) => {
				goalRecord[row['goal_id']] = row['progress']
				return goalRecord
			}, {})
			return {
				type: 'success',
				body: {
					progress: achievement.getProgress(goals) ?? 0,
				},
			}
		} catch (e) {
			console.log(e)
			return {
				type: 'failure',
				reason: `${e}`,
			}
		}
	}

	public async getAchievementPercentageCompletion(
		achievement: Achievement,
		level: number,
	): Promise<DatabaseResult<{count: number; percent: number}>> {
		try {
			const playerCount = (
				await this.pool.query(
					'SELECT count(DISTINCT user_id) FROM achievement_completion_time;',
				)
			).rows[0]['count']
			const result = await this.pool.query(
				`
					SELECT
						user_goals.achievement_id,
						user_goals.user_id,
						user_goals.goal_id,
						user_goals.progress
					FROM user_goals
					WHERE user_goals.achievement_id = $1;
				`,
				[achievement.numericId],
			)
			const allGoals = result.rows.reduce((goalRecord, row) => {
				if (!goalRecord[row['user_id']]) goalRecord[row['user_id']] = {}
				goalRecord[row['user_id']][row['goal_id']] = row['progress']
				return goalRecord
			}, {})
			const completers = Object.values(allGoals).filter(
				(goals) =>
					(achievement.getProgress(goals as Record<string, number>) ?? 0) >=
					achievement.levels[level].steps,
			).length
			return {
				type: 'success',
				body: {
					count: completers,
					percent: playerCount > 0 ? (completers / playerCount) * 100 : 0,
				},
			}
		} catch (e) {
			console.log(e)
			return {
				type: 'failure',
				reason: `${e}`,
			}
		}
	}
}
