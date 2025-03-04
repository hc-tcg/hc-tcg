import {CopyIcon} from 'components/svgs'
import css from './toolbar.module.scss'

function SpectatorCodeButton({spectatorCode}: {spectatorCode?: string | null}) {
	if (!spectatorCode) return null
	return (
		<button
			className={css.item}
			title="Copy Spectator Code"
			onClick={() => {
				navigator.clipboard.writeText(spectatorCode)
			}}
		>
			<div>
				<CopyIcon />
			</div>
		</button>
	)
}

export default SpectatorCodeButton
