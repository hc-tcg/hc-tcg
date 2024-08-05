import {Message, messages} from 'common/redux-actions'

export const localSettingsActions = messages('SET_SETTING', 'RESET_SETTINGS')

export type LocalSettingsActions = [
	{type: typeof localSettingsActions.SET_SETTING; key: string; value: any},
	{type: typeof localSettingsActions.RESET_SETTINGS; key: string},
]

export type LocalSettingsAction = Message<LocalSettingsActions>
