import * as AlertDialog from '@radix-ui/react-dialog'
import ModalCSS from 'components/alert-modal/alert-modal.module.scss'
import Button from 'components/button'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import {useSelector} from 'react-redux'
import css from './import-export.module.scss'

type Props = {
	setOpen: boolean
	onClose: () => void
}

export function MassExportModal({setOpen, onClose}: Props) {
	const databaseInfo = useSelector(getLocalDatabaseInfo)

	const getExportDecks = () => {
		const decks = databaseInfo.decks.map((deck) => {
			return deck.code + '\n'
		})
		const deckFile = new Blob(decks, {type: 'text/plain'})

		const downloadLink = document.createElement('a')
		downloadLink.href = URL.createObjectURL(deckFile)
		downloadLink.download = 'decks.txt'

		document.body.appendChild(downloadLink)
		downloadLink.click()
		document.body.removeChild(downloadLink)
	}

	return (
		<AlertDialog.Root open={setOpen} onOpenChange={(e) => !e && onClose()}>
			<AlertDialog.Portal container={document.getElementById('modal')}>
				<AlertDialog.Overlay className={ModalCSS.AlertDialogOverlay} />
				<AlertDialog.Content className={ModalCSS.AlertDialogContent}>
					<AlertDialog.Title className={ModalCSS.AlertDialogTitle}>
						Mass Export
						<AlertDialog.Close asChild>
							<button className={ModalCSS.xClose}>
								<img src="/images/CloseX.svg" alt="close" />
							</button>
						</AlertDialog.Close>
					</AlertDialog.Title>
					<AlertDialog.Description
						asChild
						className={ModalCSS.AlertDialogDescription}
					>
						<div>
							{/* EXPORT SECTION */}
							<div className={css.importControls}>
								<p className={css.instructions}>
									Press the export button to export all decks
								</p>
								<Button onClick={getExportDecks}>Export decks</Button>
							</div>
						</div>
					</AlertDialog.Description>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	)
}
