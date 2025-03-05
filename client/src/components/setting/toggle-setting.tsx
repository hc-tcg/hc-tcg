import classNames from 'classnames'
import Button from 'components/button'
import {
	LocalSetting,
	LocalSettings,
} from 'logic/local-settings/local-settings-reducer'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
import css from './setting.module.scss'

const getBoolDescriptor = (value: boolean) => {
	return value ? 'Enabled' : 'Disabled'
}

type ToggleSettingProps = {
	targetSetting: keyof LocalSettings
	name: string
	useSetting?: boolean
	inverter?: (
		setting: LocalSettings[keyof LocalSettings],
	) => LocalSettings[keyof LocalSettings]
}

export const ToggleSetting = ({
	targetSetting,
	name,
	useSetting,
	inverter,
}: ToggleSettingProps) => {
	const dispatch = useMessageDispatch()
	const settings = useSelector(getSettings)
	const toggle = () =>
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: targetSetting,
				value: inverter
					? inverter(settings[targetSetting])
					: !settings[targetSetting],
			} as LocalSetting,
		})

	return (
		<div className={css.setting}>
			<p className={classNames(css.settingTitle, css.settingItem)}>{name}</p>
			<Button className={css.settingItem} variant="default" onClick={toggle}>
				{useSetting
					? (settings[targetSetting] as string)
					: getBoolDescriptor(settings[targetSetting] as boolean)}
			</Button>
		</div>
	)
}
