import {useDispatch, useSelector} from 'react-redux'
import {setSetting} from 'logic/local-settings/local-settings-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import css from './sound-button.module.css'

function SoundButton() {
	const dispatch = useDispatch()
	const settings = useSelector(getSettings)

	const handleSoundChange = () => {
		dispatch(setSetting('soundOn', settings.soundOn !== 'off' ? 'off' : 'on'))
	}

	return (
		<button className={css.soundButton} onClick={handleSoundChange}>
			<img
				src={
					settings.soundOn !== 'off'
						? '/images/icons/volume-high-solid.svg'
						: '/images/icons/volume-xmark-solid.svg'
				}
			/>
		</button>
	)
}

export default SoundButton
