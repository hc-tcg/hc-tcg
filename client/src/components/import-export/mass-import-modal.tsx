import * as AlertDialog from '@radix-ui/react-dialog'
import {PlayerDeckT} from 'common/types/deck'
import Button from 'components/button'
import ModalCSS from 'components/alert-modal/alert-modal.module.scss'
import css from './import-export.module.scss'
import {useState} from 'react'
import {EnergyT} from 'common/types/cards'
import {getDeckFromHash} from './import-export-utils'
import { saveDeck } from 'logic/saved-decks/saved-decks'

type Props = {
	setOpen: boolean
	onClose: () => void
}

export function MassImportModal({setOpen, onClose}: Props) {
	const [currentFile, setCurrentFile] = useState<File>()

	const DECK_ICONS = [
		'any',
		'balanced',
		'builder',
		'explorer',
		'farm',
		'miner',
		'prankster',
		'pvp',
		'redstone',
		'speedrunner',
		'terraform',
	]

	const importFromFile = () => {
		if (!currentFile) return
		const fileResult = currentFile.text()
		if (!fileResult) return
		fileResult.then((newFileContent: string) => {
			const decks: PlayerDeckT[] = []
			newFileContent.split('\n').forEach((line: string) => {
				const lineComponents: string[] = line.split(':')
				const deck = getDeckFromHash(lineComponents[2].replace("\r", ""))
				if (deck.length === 0) return

				saveDeck({
					name: lineComponents[0],
					icon: DECK_ICONS.includes(lineComponents[1]) ? (lineComponents[1] as EnergyT) : 'any',
					cards: deck,
				})
			})
			onClose()
		})
	}

	const setFileChosen = (file: File | null) => {
		if (!file) {
			setCurrentFile(undefined)
			return
		}
		setCurrentFile(file)
	}

	return (
		<AlertDialog.Root open={setOpen} onOpenChange={(e) => !e && onClose()}>
			<AlertDialog.Portal container={document.getElementById('modal')}>
				<AlertDialog.Overlay className={ModalCSS.AlertDialogOverlay} />
				<AlertDialog.Content className={ModalCSS.AlertDialogContent}>
					<AlertDialog.Title className={ModalCSS.AlertDialogTitle}>
						Import Deck
						<AlertDialog.Close asChild>
							<button className={ModalCSS.xClose}>
								<img src="/images/CloseX.svg" alt="close" />
							</button>
						</AlertDialog.Close>
					</AlertDialog.Title>
					<AlertDialog.Description asChild className={ModalCSS.AlertDialogDescription}>
						<div>
							{/* IMPORT SECTION */}
							<div>
								<div className={css.importControls}>
									<input
										type="file"
										onChange={(e) => setFileChosen(e.target.files ? e.target.files[0] : null)}
									/>
									<Button onClick={importFromFile}>Import</Button>
									<p
										className={css.warning}
									>{`Warning: This will overwrite any decks with the same name`}</p>
								</div>
							</div>
						</div>
					</AlertDialog.Description>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	)
}
