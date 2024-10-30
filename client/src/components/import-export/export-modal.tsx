import {PlayerDeckT} from 'common/types/deck'
import {getHashFromDeck} from 'common/utils/import-export'
import {Modal} from 'components/modal'
import {CopyIcon} from 'components/svgs'
import css from './import-export.module.scss'

type Props = {
	setOpen: boolean
	onClose: () => void
	loadedDeck: PlayerDeckT
}

export const ExportModal = ({setOpen, onClose, loadedDeck}: Props) => {
	// EXPORT DECK FUNCTION
	const handleExportDeck = () => {
		return getHashFromDeck(loadedDeck.cards)
	}

	return (
		<Modal title="Export Deck" setOpen={setOpen} onClose={onClose}>
			<Modal.Description>
				<p className={css.instructions}>
					Export the "{loadedDeck.name}" deck to share with your friends!
				</p>
				<div className={css.exportControls}>
					<input type="text" readOnly value={handleExportDeck()} />
					<button
						className={css.copy}
						onClick={() => {
							navigator.clipboard.writeText(handleExportDeck())
						}}
					>
						{CopyIcon()}
					</button>
				</div>
			</Modal.Description>
		</Modal>
	)
}
