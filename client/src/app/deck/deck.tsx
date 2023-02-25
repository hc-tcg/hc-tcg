import classnames from 'classnames'
import {useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {CardInfoT} from 'types/cards'
import {CardT} from 'types/game-state'
import CardList from 'components/card-list'
import CARDS from 'server/cards'
import {validateDeck} from 'server/utils'
import css from './deck.module.css'
import {getPlayerDeck} from 'logic/session/session-selectors'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

const TYPE_ORDER = {
	hermit: 0,
	effect: 1,
	single_use: 2,
	item: 3,
	health: 4,
}

const sortCards = (cards: Array<CardT>): Array<CardT> => {
	return cards.slice().sort((a: CardT, b: CardT) => {
		const cardInfoA = TYPED_CARDS[a.cardId]
		const cardInfoB = TYPED_CARDS[b.cardId]
		if (cardInfoA.type !== cardInfoB.type) {
			return TYPE_ORDER[cardInfoA.type] - TYPE_ORDER[cardInfoB.type]
		} else if (
			cardInfoA.type === 'hermit' &&
			cardInfoB.type === 'hermit' &&
			cardInfoA.hermitType !== cardInfoB.hermitType
		) {
			return cardInfoA.hermitType.localeCompare(cardInfoB.hermitType)
		}
		return cardInfoA.name.localeCompare(cardInfoB.name)
	})
}

type Props = {
	setMenuSection: (section: string) => void
}
const Deck = ({setMenuSection}: Props) => {
	const dispatch = useDispatch()
	const playerDeck = useSelector(getPlayerDeck)
	const [pickedCards, setPickedCards] = useState<CardT[]>(
		playerDeck.map((cardId: any) => ({
			cardId: cardId,
			cardInstance: Math.random().toString(),
		}))
	)

	const [deckName, setDeckName] = useState<string>('')

	const [selectedDeck, setSelectedDeck] = useState<string>('')

	const [loadedDecks, setLoadedDecks] = useState<any>([])

	const commonCards = pickedCards.filter(
		(card) => TYPED_CARDS[card.cardId].rarity === 'common'
	)
	const rareCards = pickedCards.filter(
		(card) => TYPED_CARDS[card.cardId].rarity === 'rare'
	)
	const ultraRareCards = pickedCards.filter(
		(card) => TYPED_CARDS[card.cardId].rarity === 'ultra_rare'
	)

	const validationMessage = validateDeck(pickedCards.map((card) => card.cardId))

	const addCard = (card: CardT) => {
		setPickedCards((pickedCards) => {
			return [
				...pickedCards,
				{cardId: card.cardId, cardInstance: Math.random().toString()},
			]
		})
	}
	const removeCard = (card: CardT) => {
		setPickedCards((pickedCards) =>
			pickedCards.filter(
				(pickedCard) => pickedCard.cardInstance !== card.cardInstance
			)
		)
	}
	const backToMenu = () => {
		dispatch({
			type: 'UPDATE_DECK',
			payload: pickedCards.map((card) => card.cardId),
		})
		setMenuSection('mainmenu')
	}

	const loadSavedDecks = () => {
		let lskey, deck
		const deckList = []

		//loop through Local Storage keys
		for (let i = 0; i < localStorage.length; i++) {
			lskey = localStorage.key(i)
			deck = lskey?.replace(/Loadout_/g, '')

			//if ls key contains 'Loadout_' then add to deckList array.
			if (lskey?.includes('Loadout_')) {
				deckList.push(deck)
			}
		}

		console.log(
			'Loaded ' + deckList.length + ' decks from Local Storage',
			deckList.sort()
		)
		setLoadedDecks(deckList.sort())
	}

	useEffect(() => {
		loadSavedDecks()
	}, [])

	const clearDeck = () => {
		setPickedCards([])
	}

	const saveDeck = () => {
		// Check if deckName is a valid string
		if (!deckName || /^\s*$/.test(deckName)) {
			alert('Invalid deck name. Please try again.')
			return
		}
		const newDeckName = deckName.trim()

		// Check if deck name already exists
		if (loadedDecks.includes(newDeckName)) {
			const confirmOverwrite = confirm(
				'"' + newDeckName + '" already exists! Would you like to overwrite it?'
			)
			if (!confirmOverwrite) return
			localStorage.removeItem('Loadout_' + newDeckName)
			setLoadedDecks([...loadedDecks].filter((d) => d !== newDeckName))
		}

		// Save deck to Local Storage
		localStorage.setItem('Loadout_' + newDeckName, JSON.stringify(pickedCards))
		console.log(JSON.stringify(pickedCards))
		setLoadedDecks([newDeckName, ...loadedDecks])
		loadSavedDecks()
		alert('"' + newDeckName + '" was saved to Local Storage!')
	}

	const loadDeck = (selectedDeck: any) => {
		console.log('Loading deck: ', selectedDeck)
		setSelectedDeck(selectedDeck)
		if (!selectedDeck) return console.log('Could not load deck...')
		const deck: any = localStorage.getItem('Loadout_' + selectedDeck)
		const deckIds = JSON.parse(deck).filter(
			(card: CardT) => TYPED_CARDS[card.cardId]
		)
		setPickedCards(deckIds)
	}

	const deleteDeck = (deck: string) => {
		const confirmDelete = confirm(
			'Are you sure you want to delete the "' + deck + '" deck ?'
		)
		if (confirmDelete) {
			localStorage.removeItem('Loadout_' + deck)
			clearDeck()
			console.log(deck + ' was removed from LocalStorage.')

			const removedDeck = [...loadedDecks].filter((d) => d !== deck)
			setLoadedDecks(removedDeck)
			console.log('Decks in localstorage: ', removedDeck)
		}
	}

	const allCards = Object.values(TYPED_CARDS).map(
		(card: CardInfoT): CardT => ({
			cardId: card.id,
			cardInstance: card.id,
		})
	)

	const sortedAllCards = sortCards(allCards)
	const sortedDeckCards = sortCards(pickedCards)

	return (
		<div className={css.deck}>
			<div className={css.header}>
				<button disabled={!!validationMessage} onClick={backToMenu}>
					Back to menu
				</button>
				<div className={css.limits}>{validationMessage}</div>
				<div className={css.dynamicSpace} />
				<button onClick={clearDeck}>Clear</button>
				<div>
					<input
						maxLength={25}
						name="deckName"
						placeholder="Deck Name..."
						onBlur={(e) => {
							setDeckName(e.target.value)
						}}
					/>
					<button type="button" onClick={saveDeck}>
						Save
					</button>

					<select
						className={css.deckSelection}
						name="deckSelection"
						id="deckSelection"
						onChange={(e) => {
							loadDeck(e.target.value)
						}}
					>
						<option value="">Saved Decks</option>
						{loadedDecks.map((d: string) => (
							<option key={d} value={d}>
								{d}
							</option>
						))}
					</select>
					<button
						type="button"
						onClick={() => {
							deleteDeck(selectedDeck)
						}}
					>
						Delete
					</button>
				</div>
			</div>
			<div className={css.cards}>
				<div className={classnames(css.cardColumn, css.allCards)}>
					<div className={css.cardsTitle}>All cards</div>
					<CardList
						cards={sortedAllCards}
						onClick={addCard}
						size="small"
						wrap={true}
					/>
				</div>
				<div className={classnames(css.cardColumn, css.selectedCards)}>
					<div className={css.cardsTitle}>
						<span>Your deck ({pickedCards.length})</span>
						<span> - </span>
						<span className={css.commonAmount} title="Common">
							{commonCards.length}
						</span>
						<span> </span>
						<span className={css.rareAmount} title="Rare">
							{rareCards.length}
						</span>
						<span> </span>
						<span className={css.ultraRareAmount} title="Ultra rare">
							{ultraRareCards.length}
						</span>
					</div>
					<CardList
						cards={sortedDeckCards}
						onClick={removeCard}
						size="small"
						wrap={true}
					/>
				</div>
			</div>
		</div>
	)
}

export default Deck
