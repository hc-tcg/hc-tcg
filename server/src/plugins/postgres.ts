import {CARDS} from 'common/cards'
import {PlayerDeckT} from 'common/types/deck'
import {CardT} from 'common/types/game-state'
import pg from 'pg'

export class Pg {
	private static sql: pg.Pool

	public static async new() {
		//@Todo move to ENV
		const port = 5432
		const host = 'localhost'
		const database = 'hctcg'
		const user = 'ben'

		const sql = new pg.Pool({
			host: host,
			port: port,
			database: database,
			user: user,
			password: '1234',
		})

		Pg.sql = sql

		await sql.query(`
			SET CLIENT_ENCODING TO "UTF8";
			CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
			CREATE EXTENSION IF NOT EXISTS "pgcrypto";
			CREATE SEQUENCE IF NOT EXISTS "card_indexes";
			CREATE TABLE IF NOT EXISTS users (
				user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4()
			);
			CREATE TABLE IF NOT EXISTS cards (
				index integer PRIMARY KEY DEFAULT nextval('card_indexes'),
				string_id varchar(255) UNIQUE NOT NULL
			);
			CREATE TABLE IF NOT EXISTS decks (
				user_id uuid REFERENCES users(user_id),
				code varchar(7) PRIMARY KEY DEFAULT substr(digest(random()::text, 'sha1')::text, 3, 7),
				deck_name varchar(255) NOT NULL,
				icon varchar(255) NOT NULL
			);
			CREATE TABLE IF NOT EXISTS deck_cards(
				deck_code varchar(7) REFERENCES decks(code),
				card_index integer REFERENCES cards(index),
				position integer NOT NULL
			);
		`)

		const cards = Object.keys(CARDS)
		await sql.query(
			`INSERT INTO cards (string_id) SELECT * FROM UNNEST ($1::text[]) ON CONFLICT DO NOTHING`,
			[cards]
		)

		console.log(`Set up database`)
	}

	//@Todo make check ID actually exists
	public static async insertUser(postgresId: string | null | undefined): Promise<string> {
		if (postgresId) return postgresId
		const result = await Pg.sql.query(`INSERT INTO users values (DEFAULT) RETURNING user_id`)
		const code = result.rows[0]['user_id'] as string
		return code
	}

	public static async getUserDecks(uuid: string): Promise<string> {
		type deckResult = {
			deck_code: string
			deck_name: string
			icon: PlayerDeckT['icon']
			string_id: string
			position: string
		}

		const result = await Pg.sql.query(
			`SELECT deck_cards.deck_code, decks.deck_name, decks.icon, cards.string_id, deck_cards.position
			FROM decks LEFT JOIN deck_cards ON decks.code = deck_cards.deck_code
			LEFT JOIN cards ON cards.index = deck_cards.card_index
			WHERE user_id = $1`,
			[uuid]
		)

		const decks = result.rows.reduce((decks: Array<PlayerDeckT>, current: deckResult) => {
			if (
				!current.deck_code ||
				!current.deck_name ||
				!current.icon ||
				!current.string_id ||
				!current.position
			) {
				return decks
			}

			const deckIndex = decks.findIndex((deck) => deck.code === current.deck_code)

			if (deckIndex >= 0) {
				decks[deckIndex].cards.push({
					cardId: current.string_id,
					cardInstance: Math.random().toString(),
				})
				return decks
			}

			decks.push({
				name: current.deck_name,
				icon: current.icon,
				code: current.deck_code,
				cards: [
					{
						cardId: current.string_id,
						cardInstance: Math.random.toString(),
					},
				],
			})
			return decks
		}, [])

		return decks
	}

	/**Insert a new deck into the databse
	 * @returns Deck code
	 */
	public static async insertDeck(
		uuid: string,
		name: string,
		icon: string,
		cards: Array<CardT>
	): Promise<string> {
		const result = await Pg.sql.query(
			`
        INSERT INTO decks (user_id,deck_name,icon) VALUES ($1,$2,$3) RETURNING code;
        `,
			[uuid, name, icon]
		)

		const code = result.rows[0]['code'] as string

		const cardsFormatted = cards.reduce(
			(r, card, index) => {
				r.code.push(code)
				r.id.push(card.cardId)
				r.position.push(index)
				return r
			},
			{code: [] as Array<string>, id: [] as Array<string>, position: [] as Array<number>}
		)

		await Pg.sql.query(
			`
			INSERT INTO deck_cards (deck_code,card_index,position)
			SELECT new_data.code,cards.index,new_data.position FROM UNNEST (
				$1::text[],
				$2::text[],
				$3::int[]
			) as new_data (code,string_id,position) LEFT JOIN cards ON cards.string_id = new_data.string_id
			ON CONFLICT DO NOTHING;
		`,
			[cardsFormatted.code, cardsFormatted.id, cardsFormatted.position]
		)

		return code
	}

	public static async disassociateDeck(deckCode: string) {
		Pg.sql.query(`UPDATE decks SET user_id = null WHERE code = $1`, [deckCode])
	}
}

await Pg.new()

export default Pg
