import Button from 'components/button'
import {Modal} from 'components/modal'
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
