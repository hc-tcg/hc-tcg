import {Pool} from 'pg'

import QUERIES from './queries'

export const setupDatabase = () => {
	const pool = new Pool({
		host: process.env.POSTGRES_HOST || 'localhost',
		port: Number(process.env.POSTGRES_PORT || 5432),
		user: 'hctcg',
		password: 'hctcg',
		database: 'hctcg',
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

	public validate(query: string) {
		this.db.query(query)
	}
}
