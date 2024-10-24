import {LocalMessage, localMessages} from 'logic/messages'

export type databaseInfo = {
	userId: string | null
	secret: string | null
}

export type LocalSetting = {
	[Key in keyof databaseInfo]: {key: Key; value: databaseInfo[Key]}
}[keyof databaseInfo]

const defaultInfo: databaseInfo = {
	userId: null,
	secret: null,
}

const getDatabaseInfo = (): databaseInfo => {
	const storage = Object.entries(localStorage)

	const settings = storage.filter(([key]) => {
		return key.startsWith('databaseInfo:')
	})

	return settings.reduce((map, entry) => {
		const key = entry[0].replace(/^databaseInfo:/, '')
		const value = JSON.parse(entry[1])
		// @ts-ignore
		map[key] = value
		return map
	}, {} as databaseInfo)
}

const defaultState: databaseInfo = {...defaultInfo, ...getDatabaseInfo()}

const databaseKeysReducer = (
	state = defaultState,
	action: LocalMessage,
): databaseInfo => {
	switch (action.type) {
		case localMessages.SET_ID_AND_SECRET:
			return {...state, userId: action.userId, secret: action.secret}
		default:
			return state
	}
}

export default databaseKeysReducer
