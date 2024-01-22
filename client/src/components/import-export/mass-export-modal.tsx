import * as AlertDialog from '@radix-ui/react-dialog'
import {PlayerDeckT} from 'common/types/deck'
import Button from 'components/button'
import Dropdown from 'components/dropdown'
import ModalCSS from 'components/alert-modal/alert-modal.module.scss'
import DropdownCSS from '../../app/deck/deck.module.scss'
import css from './import-export.module.scss'
import {useState} from 'react'
import {EnergyT} from 'common/types/cards'
import {getDeckFromHash, getHashFromDeck} from './import-export-utils'
import {getSavedDecks} from 'logic/saved-decks/saved-decks'

type Props = {
	setOpen: boolean
	onClose: () => void
}

export function MassExportModal({setOpen, onClose}: Props) {
	const getExportDecks = () => {
		const decks: string[] = []
		getSavedDecks().forEach((deck) => {
			const deckJson = JSON.parse(deck)
			decks.push(`${deckJson.name}:${deckJson.icon}:${getHashFromDeck(deckJson.cards)}\n`)
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
						Export Deck
						<AlertDialog.Close asChild>
							<button className={ModalCSS.xClose}>
								<img src="/images/CloseX.svg" alt="close" />
							</button>
						</AlertDialog.Close>
					</AlertDialog.Title>
					<AlertDialog.Description asChild className={ModalCSS.AlertDialogDescription}>
						<div>
							{/* EXPORT SECTION */}
							<div className={css.importControls}>
								<Button onClick={getExportDecks}>Export decks</Button>
								<p className={css.instructions}>Press the export button to export all decks</p>
							</div>
						</div>
					</AlertDialog.Description>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	)
}
