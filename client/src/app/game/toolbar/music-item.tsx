import {SpeakerIcon} from 'components/svgs'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
import css from './toolbar.module.scss'

function MusicItem() {
	const settings = useSelector(getSettings)
	const dispatch = useMessageDispatch()

	const handleSoundChange = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'musicVolume',
				value: settings.musicVolume === 0 ? settings.musicVolumeStore : 0,
			},
		})
	}

	return (
		<button className={css.item} title="Mute Music" onClick={handleSoundChange}>
			<SpeakerIcon level={settings.musicVolume} />
		</button>
	)
}

export default MusicItem
