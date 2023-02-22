export const authLogin = (uuid: string) => ({
	type: 'AUTHED',
	payload: uuid,
})

export const statsUpdate = (stats: {
	w: number
	l: number
	fw: number
	fl: number
}) => ({
	type: 'STATS',
	payload: stats,
})
