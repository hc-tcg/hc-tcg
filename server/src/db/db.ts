import pg from 'pg'

const {Pool} = pg
import QUERIES from './queries'

export const setupDatabase = () => {
	const pool = new Pool({
		host: process.env.POSTGRES_HOST || 'localhost',
		port: Number(process.env.POSTGRES_PORT || 5432),
		user: 'hc-tcg',
		password: 'hc-tcg',
		database: 'hc-tcg',
		max: 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 2000,
	})

	pool.query(QUERIES.SETUP_DB)

	return pool
}

export const database = setupDatabase()
