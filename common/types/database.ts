import {TypeT} from './cards'
import {ApiDeck} from './deck'

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
	deckUsage: number
	gameUsage: number
	averagePlayers: number
	encounterChance: number
	averageCopies: number
}

export type DeckStats = {
	deck: ApiDeck
	wins: number
	lossses: number
	winrate: number | null
}

export type TypeDistributionStats = Array<{
	type: TypeT
	usage: number
	winrate: number
}>

export type TimeInformation = {}

export type GamesStats = {
	amount: number
	averageLength: number
	medianLength: TimeInformation
	standardDeviation: TimeInformation
	firstQuartile: TimeInformation
	thirdQuartile: TimeInformation
	minimum: TimeInformation
	maximum: TimeInformation
	tieRate: number
	forfeitRate: number
	errorRate: number
}

export type Achievement = {
	id: string
	name: string
	description: string
	icon: string
	total: string
}
