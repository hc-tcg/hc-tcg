import classnames from 'classnames'
import {useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {CardInfoT} from 'types/cards'
import {CardT} from 'types/game-state'
import CardList from 'components/card-list'
import CARDS from 'server/cards'
import css from './deck.module.css'
import {getPlayerDeck} from 'logic/session/session-selectors'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

type Props = {
	setMenuSection: (section: string) => void
}
const Deck = ({setMenuSection}: Props) => {
	const dispatch = useDispatch()
	const playerDeck = useSelector(getPlayerDeck)
	const [pickedCards, setPickedCards] = useState<CardT[]>(
		playerDeck.map((cardId) => ({
			cardId: cardId,
			cardInstance: Math.random().toString(),
		}))
	)

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
	const allCards = Object.values(TYPED_CARDS).map(
		(card: CardInfoT): CardT => ({
			cardId: card.id,
			cardInstance: card.id,
		})
	)
	return (
		<div className={css.deck}>
			<div className={css.header}>
				<button onClick={backToMenu}>Back to menu</button>
				<div className={css.limits}>
					Pick 30-50 cards or your deck won't update.
				</div>
			</div>
			<div className={css.cards}>
				<div className={classnames(css.cardColumn, css.allCards)}>
					<div className={css.cardsTitle}>All cards</div>
					<CardList
						cards={allCards}
						onClick={addCard}
						size="small"
						wrap={true}
					/>
				</div>
				<div className={classnames(css.cardColumn, css.selectedCards)}>
					<div className={css.cardsTitle}>Your deck ({pickedCards.length})</div>
					<CardList
						cards={pickedCards}
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
