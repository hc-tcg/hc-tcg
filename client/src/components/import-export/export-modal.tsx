import {Deck} from 'common/types/deck'
import {Modal} from 'components/modal'
import {CopyIcon} from 'components/svgs'
import {localMessages, useMessageDispatch} from 'logic/messages'
import css from './import-export.module.scss'

type Props = {
	setOpen: boolean
	onClose: () => void
	loadedDeck: Deck
}

export const ExportModal = ({setOpen, onClose, loadedDeck}: Props) => {
	const dispatch = useMessageDispatch()

	if (setOpen)
		dispatch({
			type: localMessages.EXPORT_DECK,
			code: loadedDeck.code,
		})

	return (
		<Modal title="Export Deck" setOpen={setOpen} onClose={onClose}>
			<Modal.Description>
				<p className={css.instructions}>
					Export "{loadedDeck.name}" to share with your friends!
				</p>
				<div className={css.exportControls}>
					<input type="text" readOnly value={loadedDeck.code} />
					<button
						className={css.copy}
						onClick={() => {
							navigator.clipboard.writeText(loadedDeck.code)
							dispatch({
								type: localMessages.TOAST_OPEN,
								open: true,
								title: 'Hash copied!',
								description: `Copied ${loadedDeck.code} to clipboard.`,
								image: 'copy',
							})
						}}
					>
						{CopyIcon()}
					</button>
				</div>
			</Modal.Description>
		</Modal>
	)
}
