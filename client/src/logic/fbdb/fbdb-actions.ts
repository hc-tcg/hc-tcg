export const authLogin = (uuid: string) => ({
	type: 'AUTHED',
	payload: uuid,
})

export const resetStats = () => ({
	type: 'RESET_STATS',
})

export const statsUpdate = (stats: {
	w: number
	l: number
	fw: number
	fl: number
	t: number
}) => ({
	type: 'STATS',
	payload: stats,
})
