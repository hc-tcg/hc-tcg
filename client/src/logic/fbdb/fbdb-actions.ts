import {Message, messages} from 'common/redux-actions'

export const fbdbActions = messages('AUTHED', 'RESET_STATS', 'STATS')

export type FbdbActions = [
	{type: typeof fbdbActions.AUTHED; uuid: string},
	{type: typeof fbdbActions.RESET_STATS},
	{
		type: typeof fbdbActions.STATS
		w: number
		l: number
		fw: number
		fl: number
		t: number
	},
]

export type FbdbAction = Message<FbdbActions>
