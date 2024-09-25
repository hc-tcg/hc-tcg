import {PlayerDeckT} from 'common/types/deck'
import pg from 'pg'
import {Card} from '../../../common/cards/base/types'

export const setupDatabase = (
	allCards: Array<Card>,
	env: {
		HOST: string
		USER: string
		PASSWORD: string
		DATABASE: string
	},
) => {
	const pool = new pg.Pool({
		host: env.HOST,
		user: env.USER,
		password: env.PASSWORD,
		database: env.DATABASE,
		max: 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 2000,
	})

	return new Databse(pool, allCards)
}

export type User = {
	uuid: string
	secret: string
	username: string
	minecraftName: string | null
}

export type Deck = {
	code: string
	name: string
	icon: string
	tags: Array<string>
	cards: Array<Card>
}

export class Databse {
	private db: pg.Pool
	private allCards: Array<Card>

	constructor(db: pg.Pool, allCards: Array<Card>) {
		this.db = db
		this.allCards = allCards
	}

	public async new() {
		this.db.query(
			`
			CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
			CREATE EXTENSION IF NOT EXISTS "pgcrypto";
			CREATE TABLE IF NOT EXISTS users(
				user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
				secret varchar(255) NOT NULL,
				username varchar(255) NOT NULL,
				minecraft_name varchar(255)
			);
			CREATE TABLE IF NOT EXISTS decks(
				user_id uuid REFERENCES users(user_id),
				deck_code varchar(7) PRIMARY KEY DEFAULT substr(digest(random()::text, 'sha1')::text, 3, 7),
				name varchar(255) NOT NULL,
				icon varchar(255) NOT NULL,
				visible boolean NOT NULL DEFAULT 'true'
			);
			CREATE TABLE IF NOT EXISTS games(
				date date NOT NULL,
				winer uuid REFERENCES users(user_id),
				loser uuid REFERENCES users(user_id),
				winner_deck_code varchar(7) REFERENCES decks(deck_code),
				loser_deck_code varchar(7) REFERENCES decks(deck_code),
				tie boolean NOT NULL
			);
			CREATE TABLE IF NOT EXISTS cards(
				card_id integer PRIMARY KEY NOT NULL
			);
			CREATE TABLE IF NOT EXISTS deck_cards(
				deck_code varchar(7) REFERENCES decks(deck_code),
				card_id integer REFERENCES cards(card_id),
				copies integer NOT NULL
			);
			CREATE TABLE IF NOT EXISTS user_tags(
				user_id uuid REFERENCES users(user_id),
				tag_id varchar(7) PRIMARY KEY DEFAULT substr(digest(random()::text, 'sha1')::text, 3, 7),
				name varchar(255) NOT NULL,
				color varchar(7) NOT NULL
			);
			CREATE TABLE IF NOT EXISTS deck_tags(
				deck_code varchar(7) REFERENCES decks(deck_code),
				tag_id varchar(7) REFERENCES user_tags(tag_id)
			);
				`,
		)

		await this.db.query(
			'INSERT INTO cards (card_id) SELECT * FROM UNNEST ($1::int[]) ON CONFLICT DO NOTHING',
			[this.allCards.map((card) => card.numericId)],
		)

		console.log('Database initialized')
	}

	private async checkSecret(user_id: string, secret: string): Promise<boolean> {
		try {
			return (
				(
					await this.db.query(
						'SELECT * FROM users WHERE secret = $1 AND WHERE user_id = $2',
						[secret, user_id],
					)
				).rows.length > 0
			)
		} catch (err) {
			console.log(err)
			return false
		}
	}

	/*** Insert a user into the Database. Returns `user`. */
	public async insertUser(
		username: string,
		minecraftName: string | null,
	): Promise<User | null> {
		try {
			const secret = await this.db.query('SELECT * FROM uuid_generate_v4()')
			const user = await this.db.query(
				"INSERT INTO users (username, minecraft_name, secret) values ($1,$2,crypt($3, gen_salt('bf', 15))) RETURNING (user_id)",
				[username, minecraftName, secret],
			)
			return {
				uuid: user.rows[0]['user_id'],
				secret: secret.rows[0]['uuid_generate_v4'],
				username: username,
				minecraftName: minecraftName,
			}
		} catch (err) {
			console.log(err)
			return null
		}
	}

	/*** Insert a deck into the Database. Returns the deck code. */
	public async insertDeck(
		deck: PlayerDeckT,
		user_id: string,
		secret: string,
	): Promise<string | null> {
		try {
			if (!(await this.checkSecret(secret, user_id))) return null
			const deckResult = await this.db.query(
				"INSERT INTO decks (user_id, name, icon) values (crypt($1, gen_salt('bf', 15)),$2,$3) RETURNING (deck_code)",
				[user_id, deck.name, deck.icon],
			)
			const deckCode: string = deckResult.rows[0]['deck_code']

			await this.db.query(
				`INSERT INTO deck_cards (deck_code,card_id,copies) values($1,SELECT * FROM UNNEST ($2::int[]),1) 
				ON CONFLICT DO UPDATE SET copies = copies + 1`,
				[deckCode, deck.cards.map((card) => card.props.numericId)],
			)
			return deckCode
		} catch (err) {
			console.log(err)
			return null
		}
	}

	/** Return the deck with a specific ID. */
	public async getDeckFromID(deckCode: string): Promise<Deck | null> {
		try {
			const deck = (
				await this.db.query(
					`SELECT * FROM decks WHERE deck_code = $1
					LEFT JOIN deck_cards ON decks.deck_code = deck_cards.deck_code
					`,
					[deckCode],
				)
			).rows
			const code = deck[0]['deck_code']
			const name = deck[0]['name']
			const icon = deck[0]['icon']
			const cards: Array<Card> = deck.reduce((r: Array<Card>, row) => {
				return [
					...r,
					this.allCards.find((card) => card.numericId === row['card_id']),
				]
			}, [])
			const tags: Array<string> = []

			return {
				code,
				name,
				icon,
				cards,
				tags,
			}
		} catch (err) {
			console.log(err)
			return null
		}
	}

	// This function is horribly written, need to redo it
	/** Return the decks associated with a user. */
	public async getDecks(user_id: string): Promise<Array<Deck | null>> {
		try {
			const decks = await this.db.query(
				'SELECT (code) FROM decks WHERE user_id = $1',
				[user_id],
			)
			const allDecks: Array<Deck | null> = []
			for (let i = 0; i < decks.rows.length; i++) {
				allDecks.push(await this.getDeckFromID(decks.rows[i]['deck_code']))
			}
			return allDecks
		} catch (err) {
			console.log(err)
			return []
		}
	}
	/** Disassociate a deck from a user. This is used when a deck is deleted or updated.*/
	public async disassociateDeck(
		deckCode: string,
		user_id: string,
		secret: string,
	): Promise<void> {
		try {
			if (!(await this.checkSecret(secret, user_id))) return
			await this.db.query(
				"UPDATE decks SET visible = 'false' WHERE deck_code = $1 AND user_id = $2",
				[deckCode, user_id],
			)
		} catch (err) {
			console.log(err)
		}
	}
	// Insert tag
	// Delete tag
	// Get tags
	// Get user stats
	// Get deck stats
	// Get user info
	// Set user info
}
