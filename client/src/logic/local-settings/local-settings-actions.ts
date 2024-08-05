import {Message, messages} from 'common/redux-actions'

export const localSettingsActions = messages('SET_SETTING', 'RESET_SETTINGS')

export type LocalSettingsAction = Message<
	typeof setSetting | typeof resetSetting
>

export const setSetting = (key: string, value: any) => ({
	type: localSettingsActions.SET_SETTING,
	payload: {key, value},
})

export const resetSetting = (key: string) => ({
	type: localSettingsActions.RESET_SETTINGS,
	payload: key,
})
