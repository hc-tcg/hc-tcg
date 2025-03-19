import {AchievementProgress} from '../types/achievements'
import {TypeT} from './cards'
import {ApiDeck, Deck} from './deck'

export type User = {
	uuid: string
	secret: string
	username: string
	minecraftName: string | null
	title: string | null
	coin: string | null
	heart: string | null
	background: string | null
	border: string | null
	decks: Array<Deck>
	achievements: AchievementData
	stats: PlayerStats
	gameHistory: Array<GameHistory>
	banned: boolean
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

export type PlayerStats = Stats & {
	uniquePlayersEncountered: number
	playtime: {
		hours: number
		minutes: number
		seconds: number
	}
	topCards: Array<string>
}

export type CardStats = {
	id: number
	winrate: number | null
	adjustedWinrate: number | null
	winrateDifference: number | null
	deckUsage: number
	gameUsage: number
	averagePlayers: number
	encounterChance: number
	averageCopies: number
}

export type DeckStats = {
	deck: ApiDeck
	wins: number
	losses: number
	winrate: number | null
}

export type TypeDistributionStats = {
	monoTypeWinrate: number
	multiTypeWinrate: number
	multiTypeFrequency: number
	types: Array<{
		type: Array<TypeT | 'typeless'>
		frequency: number
		winrate: number
	}>
}

export type TimeInformation = {}

export type GamesStats = {
	games: number
	gameLength: {
		averageLength: number
		medianLength: TimeInformation
		standardDeviation: TimeInformation
		firstQuartile: TimeInformation
		thirdQuartile: TimeInformation
		minimum: TimeInformation
		maximum: TimeInformation
	}
	tieRate: number
	forfeitRate: number
	errorRate: number
}

export type AchievementData = {
	achievementData: AchievementProgress
}

export type ApiGame = {
	firstPlayerName: string
	secondPlayerName: string
	startTime: number
	winner: string | null
}

export type GameHistoryPlayer = {
	player: 'you' | 'opponent'
	name: string
	minecraftName: string
	uuid: string
}

export type GameHistory = {
	firstPlayer: GameHistoryPlayer
	secondPlayer: GameHistoryPlayer
	hasReplay: boolean
	startTime: Date
	length: {
		minutes: number
		seconds: number
		milliseconds: number
	}
	turns: number | null
	winner: string
	usedDeck: Deck
	id: number
}
