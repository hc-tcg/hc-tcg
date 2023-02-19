export const authlogin = (uuid: string) => ({
	type: 'AUTHED',
	payload: uuid,
})

export const statsupdate = (stats: {w: number, l: number, fw: number, fl: number}) => ({
	type: 'STATS',
	payload: stats,
})
