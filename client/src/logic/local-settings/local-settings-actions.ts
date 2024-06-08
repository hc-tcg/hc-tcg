export const setSetting = (key: string, value: any) => ({
	type: 'SET_SETTING',
	payload: {key, value},
})

export const resetSetting = (key: string) => ({
	type: 'RESET_SETTING',
	payload: key,
})
