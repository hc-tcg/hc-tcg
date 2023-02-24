export const setSetting = (key: string, value: any) => ({
	type: 'SET_SETTING',
	payload: {key, value},
})
