import pg from 'pg'

const {Pool} = pg

const setupDatabase = () => {
	const pool = new Pool({
		host: 'localhost',
		user: 'hc-tcg',
		max: 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 2000,
	})

	pool.query(`
		CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
		CREATE EXTENSION IF NOT EXISTS "pgcrypto";
		CREATE TABLE IF NOT EXISTS users(
			user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4();
			secret varchar(255) NOT NULL;
			username varchar(255) NOT NULL;
			minecraft_name varchar(15) NOT NULL;
			/* Please forgive me for this sin. I think it's ok here, as we don't ever need to
			grab users by what they have their settings set as, and this makes it so we don't
			need to update the schema if we ever add/remove settings.
			*/
			settings varchar(65536) NOT NULL;
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

	`)

	return pool
}

export const database = setupDatabase()
