import {useRef} from 'react'
import {CardInfoT} from 'types/cards'
import {CardT} from 'types/game-state'
import CARDS from 'server/cards'
import css from './import-export.module.css'
import {universe} from './import-export-const'
import Modal from 'components/modal'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

type Props = {
	pickedCards: Array<CardT>
	setPickedCards: (pickedCards: Array<CardT>) => void
	close: () => void
}

const ImportExport = ({pickedCards, setPickedCards, close}: Props) => {
	const inputRef = useRef<HTMLInputElement | null>(null)

	const importDeck = () => {
		if (!inputRef.current) return
		const b64 = atob(inputRef.current.value)
			.split('')
			.map((char) => char.charCodeAt(0))
		const deck = []
		for (let i = 0; i < b64.length; i++) {
			deck.push({
				cardId: universe[b64[i]],
				cardInstance: Math.random().toString(),
			})
		}
		if (!deck) return
		const deckCards = deck.filter((card: CardT) => TYPED_CARDS[card.cardId])
		setPickedCards(deckCards)
	}

	const exportDeck = () => {
		if (!inputRef.current) return
		const indicies = []
		for (let i = 0; i < pickedCards.length; i++) {
			indicies.push(universe.indexOf(String(pickedCards[i].cardId)))
		}
		const b64cards = btoa(String.fromCharCode.apply(null, indicies))
		inputRef.current.value = b64cards
	}

	return (
		<Modal title="Import/Export" closeModal={close}>
			<div className={css.importExport}>
				<div className={css.ieInput}>
					<input placeholder="Deck hash..." ref={inputRef} />
				</div>
				<div className={css.ieButtons}>
					<button type="button" onClick={importDeck}>
						Import
					</button>
					<button type="button" onClick={exportDeck}>
						Export
					</button>
				</div>
			</div>
		</Modal>
	)
}

export default ImportExport
