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
				key: 'musicMuted',
				value: !settings.musicMuted,
			},
		})
	}

	return (
		<button
			className={css.item}
			title="Mute Music"
			onClick={handleSoundChange}
		>
			<SpeakerIcon level={settings.musicMuted ? 0 : 100} />
		</button>
	)
}

export default MusicItem
