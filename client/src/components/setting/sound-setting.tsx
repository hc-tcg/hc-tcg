import classNames from 'classnames'
import Slider from 'components/slider'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
import css from './setting.module.scss'

const getPercentDescriptor = (value: number) => {
	if (value !== 0) return `${value}%`
	return 'Disabled'
}

type VolumeSetting =
	| 'globalVolume'
	| 'sfxVolume'
	| 'musicVolume'
	| 'voiceVolume'

type SoundSettingProps = {
	name: string
	id: 'global' | 'sfx' | 'music' | 'voice'
}

export const SoundSetting = ({name, id}: SoundSettingProps) => {
	const dispatch = useMessageDispatch()
	const settings = useSelector(getSettings)
	const value = settings[(id + 'Volume') as VolumeSetting]

	const handleChange = (ev: React.SyntheticEvent<HTMLInputElement>) => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: (id + 'Volume') as VolumeSetting,
				value: parseInt(ev.currentTarget.value),
			},
		})
	}

	return (
		<div className={css.setting}>
			<p className={classNames(css.settingTitle, css.settingItem)}>{name}</p>
			<Slider className={css.settingItem} value={value} onInput={handleChange}>
				{getPercentDescriptor(value)}
			</Slider>
		</div>
	)
}
