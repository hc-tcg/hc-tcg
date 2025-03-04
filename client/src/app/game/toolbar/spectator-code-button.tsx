import {CopyIcon} from 'components/svgs'
import {localMessages} from 'logic/messages'
import {useDispatch} from 'react-redux'
import css from './toolbar.module.scss'

function SpectatorCodeButton({spectatorCode}: {spectatorCode?: string | null}) {
	if (!spectatorCode) return null
	const dispatch = useDispatch()

	const handleCodeClick = () => {
		navigator.clipboard.writeText(spectatorCode)

		dispatch({
			type: localMessages.TOAST_OPEN,
			open: true,
			title: 'Code copied!',
			description: `Copied spectator code to clipboard.`,
			image: 'copy',
		})
	}

	return (
		<button
			className={css.item}
			title="Copy Spectator Code"
			onClick={handleCodeClick}
		>
			<div className={css.copy}>
				{spectatorCode}
				<CopyIcon />
			</div>
		</button>
	)
}

export default SpectatorCodeButton
