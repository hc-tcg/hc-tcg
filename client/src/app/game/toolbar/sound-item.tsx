import {SpeakerIcon} from 'components/svgs'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {useSelector} from 'react-redux'
import css from './toolbar.module.scss'
import {actions, useActionDispatch} from 'logic/actions'

function SoundItem() {
	const settings = useSelector(getSettings)
	const dispatch = useActionDispatch()

	const handleSoundChange = () => {
		dispatch({type: actions.SETTINGS_SET, key: 'muted', value: !settings.muted})
	}

	return (
		<button
			className={css.item}
			title="Mute Sounds (M)"
			onClick={handleSoundChange}
		>
			<SpeakerIcon level={settings.muted ? 0 : 100} />
		</button>
	)
}

export default SoundItem
