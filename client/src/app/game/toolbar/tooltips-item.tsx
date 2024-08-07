import {actions, useActionDispatch} from 'logic/messages'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {useSelector} from 'react-redux'
import css from './toolbar.module.scss'

function TooltipsItem() {
	const dispatch = useActionDispatch()
	const settings = useSelector(getSettings)

	const handleTooltips = () => {
		dispatch({
			type: actions.SETTINGS_SET,
			key: 'showAdvancedTooltips',
			value: settings.showAdvancedTooltips === 'on' ? 'off' : 'on',
		})
	}

	return (
		<button
			className={css.item}
			title={
				settings.showAdvancedTooltips === 'on'
					? 'Hide detailed tooltips (T)'
					: 'Show detailed tooltips (T)'
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
