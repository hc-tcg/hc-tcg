const queries = {
	SETUP_DB: `
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
		previous_code varchar(7) REFERENCES decks(deck_code),
		name varchar(255) NOT NULL,
		icon varchar(255) NOT NULL
	);
	CREATE TABLE IF NOT EXISTS games(
		game_time timestamp NOT NULL,
		winner uuid REFERENCES users(user_id),
		loser uuid REFERENCES users(user_id),
		winner_deck_code varchar(7) REFERENCES decks(deck_code),
		loser_deck_code varchar(7) REFERENCES decks(deck_code),
		outcome varchar(31) NOT NULL
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
		user_id uuid REFERENCES users(user_id),
		tag_id varchar(7) PRIMARY KEY DEFAULT substr(digest(random()::text, 'sha1')::text, 3, 7),
		name varchar(255) NOT NULL,
		color varchar(7) NOT NULL
	);
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
}

export default queries
