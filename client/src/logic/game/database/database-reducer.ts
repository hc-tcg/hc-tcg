import {AchievementProgress} from 'common/types/achievements'
import {GameHistory, Stats} from 'common/types/database'
import {ApiDeck, Deck, Tag} from 'common/types/deck'
import {Appearance} from 'common/cosmetics/types'
import {LocalMessage, localMessages} from 'logic/messages'
import {defaultAppearance} from 'common/cosmetics/default'

export type DatabaseInfo = {
	userId: string | null
	secret: string | null
	decks: Array<Deck>
	gameHistory: Array<GameHistory>
	currentImport: ApiDeck | null
	tags: Array<Tag>
	achievements: AchievementProgress
	stats: Stats
	noConnection: boolean
	appearance: Appearance
}

export type LocalDatabase = {
	[Key in keyof DatabaseInfo]: {key: Key; value: DatabaseInfo[Key]}
}[keyof DatabaseInfo]

const defaultInfo: DatabaseInfo = {
	noConnection: false,
	userId: null,
	secret: null,
	decks: [],
	gameHistory: [],
	tags: [],
	achievements: {},
	stats: {
		gamesPlayed: 0,
		wins: 0,
		losses: 0,
		ties: 0,
		forfeitWins: 0,
		forfeitLosses: 0,
	},
	currentImport: null,
	appearance: defaultAppearance,
}

const getDatabaseInfo = (): DatabaseInfo => {
	const storage = Object.entries(localStorage)

	const info = storage.filter(([key]) => {
		return key.startsWith('databaseInfo:')
	})

	return info.reduce((map, entry) => {
		const key = entry[0].replace(/^databaseInfo:/, '')
		const value = entry[1]
		// @ts-ignore
		map[key] = value
		return map
	}, {} as DatabaseInfo)
}

const defaultState: DatabaseInfo = {...defaultInfo, ...getDatabaseInfo()}

const databaseReducer = (
	state = defaultState,
	action: LocalMessage,
): DatabaseInfo => {
	switch (action.type) {
		case localMessages.SET_ID_AND_SECRET:
			return {...state, userId: action.userId, secret: action.secret}
		case localMessages.RESET_ID_AND_SECRET:
			return {...state, userId: null, secret: null}
		case localMessages.COSMETICS_SET:
			return {...state, appearance: action.appearance}
		case localMessages.DATABASE_SET:
			return {...state, [action.data.key]: action.data.value}
		default:
			return state
	}
}

export default databaseReducer
