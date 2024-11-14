import {Deck} from './deck'

export type User = {
	uuid: string
	secret: string
	username: string
	minecraftName: string | null
}

export type UserWithoutSecret = {
	uuid: string
	username: string
	minecraftName: string | null
}

export type Stats = {
	gamesPlayed: number
	wins: number
	losses: number
	ties: number
	forfeitWins: number
	forfeitLosses: number
}

export type CardStats = {
	id: number
	winrate: number | null
	rarity: number
	averageCopies: number
}

export type DeckStats = {
	deck: Deck
	wins: number
	lossses: number
	winrate: number | null
}

export type Achievement = {
	id: string
	name: string
	description: string
	icon: string
	total: string
}
