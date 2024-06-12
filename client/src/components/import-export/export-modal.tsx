import * as AlertDialog from '@radix-ui/react-alert-dialog'
import {PlayerDeckT} from 'common/types/deck'
import {CopyIcon} from 'components/svgs'
import ModalCSS from 'components/alert-modal/alert-modal.module.scss'
import css from './import-export.module.scss'
import {getHashFromDeck} from './import-export-utils'

type Props = {
	setOpen: boolean
	onClose: (isOpen: boolean) => void
	loadedDeck: PlayerDeckT
}

export const ExportModal = ({setOpen, onClose, loadedDeck}: Props) => {
	return (
		<AlertDialog.Root open={setOpen} onOpenChange={(e) => onClose(e)}>
			<AlertDialog.Portal container={document.getElementById('modal')}>
				<AlertDialog.Overlay className={ModalCSS.AlertDialogOverlay} />
				<AlertDialog.Content className={ModalCSS.AlertDialogContent}>
					<AlertDialog.Title className={ModalCSS.AlertDialogTitle}>
						Export Deck
						<AlertDialog.Cancel asChild>
							<button className={ModalCSS.xClose}>
								<img src="/images/CloseX.svg" alt="close" />
							</button>
						</AlertDialog.Cancel>
					</AlertDialog.Title>
					<AlertDialog.Description asChild className={ModalCSS.AlertDialogDescription}>
						<div>
							{/* EXPORT SECTION */}
							<div>
								<p className={css.instructions}>
									Export the "{loadedDeck.name}" deck to share with your friends!
								</p>
								<div className={css.exportControls}>
									<input type="text" readOnly value={loadedDeck.code} />
									<button
										className={css.copy}
										onClick={() => {
											navigator.clipboard.writeText(loadedDeck.code)
										}}
									>
										{CopyIcon()}
									</button>
								</div>
							</div>
						</div>
					</AlertDialog.Description>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	)
}
