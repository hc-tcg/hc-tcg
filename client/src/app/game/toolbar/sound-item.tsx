import {useDispatch, useSelector} from 'react-redux'
import {setSetting} from 'logic/local-settings/local-settings-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import classnames from 'classnames'
import css from './toolbar.module.scss'

function SoundItem() {
	const dispatch = useDispatch()
	const settings = useSelector(getSettings)

	const handleSoundChange = () => {
		dispatch(
			setSetting('soundVolume', settings.soundVolume !== '0' ? '0' : '100')
		)
	}

	return (
		<div
			className={classnames(css.item, css.clickable, css.soundItem)}
			title="Sound On/Off"
			onClick={handleSoundChange}
		>
			<img
				src={
					settings.soundVolume !== '0'
						? '/images/icons/volume-high-solid.svg'
						: '/images/icons/volume-xmark-solid.svg'
				}
				width="25"
			/>
		</div>
	)
}

export default SoundItem
