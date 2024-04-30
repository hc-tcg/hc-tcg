import {useDispatch, useSelector} from 'react-redux'
import {getOpenedModal} from 'logic/game/game-selectors'
import css from './toolbar.module.scss'
import {setSetting} from 'logic/local-settings/local-settings-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'

function TooltipsItem() {
	const dispatch = useDispatch()
	const settings = useSelector(getSettings)

	const handleTooltips = () => {
		dispatch(
			setSetting('showAdvancedTooltips', settings.showAdvancedTooltips === 'on' ? 'off' : 'on')
		)
	}

	return (
		<button
			className={css.item}
			title={
				settings.showAdvancedTooltips === 'on'
					? 'Hide detailed descriptions'
					: 'Show detailed descriptions'
			}
			onClick={handleTooltips}
		>
			<img
				src={
					settings.showAdvancedTooltips === 'on'
						? '/images/toolbar/tooltips.png'
						: '/images/toolbar/tooltips-off.png'
				}
				width="30"
			/>
		</button>
	)
}

export default TooltipsItem
