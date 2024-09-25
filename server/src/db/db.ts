import {Pool} from 'pg'
import {Card} from '../../../common/cards/base/types'

export const setupDatabase = (allCards: Array<Card>, env: any) => {
	const pool = new Pool({
		host: env.HOST,
		user: env.USER,
		password: env.PASSWORD,
		database: env.DATABASE,
		max: 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 2000,
	})

	return new Databse(pool)
}

class Databse {
	private db: Pool

	constructor(db: Pool) {
		this.db = db
	}

	public new() {
		this.db.query(
			`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE TABLE IF NOT EXISTS users(
      	user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4();
      	secret varchar(255) NOT NULL;
      	username varchar(255) NOT NULL;
      	minecraft_name varchar(15) NOT NULL;
      );
      CREATE TABLE IF NOT EXISTS decks(
      	user_id uuid REFERENCES users(user_id);
      	code varchar(7) PRIMARY KEY DEFAULT substr(digest(random()::text, 'sha1')::text, 3, 7);
      	name varchar(255) NOT NULL;
      	icon varchar(255) NOT NULL;
      	wins integer NOT NULL;
      	losses integer NOT NULL;
      	ties integer NOT NULL;
      );
      CREATE TABLE IF NOT EXISTS cards(
      	card_id integer PRIMARY KEY NOT NULL;
      );
      CREATE TABLE IF NOT EXISTS deck_cards(
      	deck_code varchar(7) REFERENCES decks(deck_code);
      	card_id integer REFERENCES cards(card_id);
      	copies integer NOT NULL;
      );
      CREATE TABLE IF NOT EXISTS deck_tags(
      	deck_code varchar(7) REFERENCES decks(deck_code);
      	tag_id integer REFERENCES user_tags(tag_id);
      );
      CREATE TABLE IF NOT EXISTS user_tags(
      	user_id uuid REFERENCES users(user_id);
      	code varchar(7) PRIMARY KEY DEFAULT substr(digest(random()::text, 'sha1')::text, 3, 7);
      	name varchar(255) NOT NULL;
      	color varchar(7) NOT NULL;
      );
	`,
		)
	}
}
