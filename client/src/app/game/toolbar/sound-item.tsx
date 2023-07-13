import {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {setSetting} from 'logic/local-settings/local-settings-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {SpeakerIcon} from 'components/svgs'
import css from './toolbar.module.scss'

function SoundItem() {
	const dispatch = useDispatch()
	const settings = useSelector(getSettings)
	const [originalVolume] = useState<string>(settings.soundVolume)

	const handleSoundChange = () => {
		// if volume is on, turn it off.
		// if originalVolume is 0, turn it to 100.
		// if volume is off, turn it back to originalVolume.
		const newVolume =
			settings.soundVolume !== '0' ? '0' : originalVolume === '0' ? '100' : originalVolume

		dispatch(setSetting('soundVolume', newVolume))
	}

	return (
		<button className={css.item} title="Toggle Sounds" onClick={handleSoundChange}>
			<SpeakerIcon level={settings.soundVolume} />
		</button>
	)
}

export default SoundItem
