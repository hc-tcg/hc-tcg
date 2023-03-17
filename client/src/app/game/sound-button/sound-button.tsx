import {useDispatch, useSelector} from 'react-redux'
import {setSetting} from 'logic/local-settings/local-settings-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import css from './sound-button.module.css'

function SoundButton() {
	const dispatch = useDispatch()
	const settings = useSelector(getSettings)

	const handleSoundChange = () => {
		dispatch(
			setSetting('soundVolume', settings.soundVolume !== '0' ? '0' : '100')
		)
	}

	return (
		<button className={css.soundButton} onClick={handleSoundChange}>
			<img
				src={
					settings.soundVolume !== '0'
						? '/images/icons/volume-high-solid.svg'
						: '/images/icons/volume-xmark-solid.svg'
				}
			/>
		</button>
	)
}

export default SoundButton
