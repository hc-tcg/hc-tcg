import {Card} from '../../../common/cards/base/types'
import pg from 'pg'

export const setupDatabase = (allCards: Array<Card>, env: any) => {
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

class Databse {
	private db: pg.Pool
	private allCards: Array<Card>

	constructor(db: pg.Pool, allCards: Array<Card>) {
		this.db = db
		this.allCards = allCards
	}

	public new() {
		this.db.query(
			`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE TABLE IF NOT EXISTS users(
      	user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      	secret varchar(255) NOT NULL,
      	username varchar(255) NOT NULL,
      	minecraft_name varchar(15) NOT NULL
      );
      CREATE TABLE IF NOT EXISTS decks(
      	user_id uuid REFERENCES users(user_id),
      	deck_code varchar(7) PRIMARY KEY DEFAULT substr(digest(random()::text, 'sha1')::text, 3, 7),
      	name varchar(255) NOT NULL,
      	icon varchar(255) NOT NULL
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

		this.db.query(
			'INSERT INTO cards (card_id) SELECT * FROM UNNEST ($1::int[]) ON CONFLICT DO NOTHING',
			[this.allCards.map((card) => card.numericId)],
		)

		console.log('Database initialized')
	}
}
