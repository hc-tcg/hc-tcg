import {SpeakerIcon} from 'components/svgs'
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
				key: 'globalMuted',
				value: !settings.globalMuted,
			},
		})
	}

	return (
		<button
			className={css.item}
			title="Mute Sounds (M)"
			onClick={handleSoundChange}
		>
			<SpeakerIcon level={settings.globalMuted ? 0 : 100} />
		</button>
	)
}

export default SoundItem
