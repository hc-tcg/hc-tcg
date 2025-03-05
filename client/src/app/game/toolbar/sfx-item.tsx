import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
import css from './toolbar.module.scss'

function SoundItem() {
	const settings = useSelector(getSettings)
	const dispatch = useMessageDispatch()

	const handleSoundChange = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'globalVolume',
				value: settings.globalVolume === 0 ? settings.globalVolumeStore : 0,
			},
		})
	}

	const enable = settings.globalVolume === 0 ? 'disable' : 'enable'

	return (
		<button
			className={css.item}
			title="Mute Sounds (M)"
			onClick={handleSoundChange}
		>
			{
				<img
					className={css.audioIcon}
					src={`/images/icons/audio_${enable}.png`}
				></img>
			}
		</button>
	)
}

export default SoundItem
