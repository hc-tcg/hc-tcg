import {Action, actions} from 'common/redux-actions'

export const fbdbActions = actions('AUTHED', 'RESET_STATS', 'STATS')

export type FbdbAction = Action<
	typeof authLogin | typeof resetStats | typeof statsUpdate
>

export const authLogin = (uuid: string) => ({
	type: fbdbActions.AUTHED,
	payload: uuid,
})

export const resetStats = () => ({
	type: fbdbActions.RESET_STATS,
})

export const statsUpdate = (stats: {
	w: number
	l: number
	fw: number
	fl: number
	t: number
}) => ({
	type: fbdbActions.STATS,
	payload: stats,
})
