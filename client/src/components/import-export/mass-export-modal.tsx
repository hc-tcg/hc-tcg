import {loadSavedDeck} from 'common/types/deck'
import {getHashFromDeck} from 'common/utils/import-export'
import Button from 'components/button'
import {getSavedDecks} from 'logic/saved-decks/saved-decks'
import css from './import-export.module.scss'
import {Modal} from 'components/modal'

type Props = {
	setOpen: boolean
	onClose: () => void
}

export function MassExportModal({setOpen, onClose}: Props) {
	const getExportDecks = () => {
		const decks: string[] = []
		getSavedDecks().forEach((deck) => {
			let savedDeck = loadSavedDeck(JSON.parse(deck))
			if (savedDeck) {
				decks.push(
					`${savedDeck.name}:${savedDeck.icon}:${getHashFromDeck(savedDeck.cards)}\n`,
				)
			}
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
		<Modal title="Mass Export" setOpen={setOpen} onClose={onClose}>
			<Modal.Description>
				<div className={css.importControls}>
					<p className={css.instructions}>
						Press the export button to export all decks.
					</p>
				</div>
			</Modal.Description>
			<Modal.Options fillSpace>
				<Button onClick={getExportDecks}>Export decks</Button>
			</Modal.Options>
		</Modal>
	)
}
