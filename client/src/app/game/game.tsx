import React, {useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {RootState} from 'store'
import CARDS from 'server/cards'
import {CardInfoT} from 'types/cards'
import {CardT} from 'types/game-state'
import Card from 'components/card'
import Board from './board'
import css from './game.module.css'
import AttackModal from './modals/attack-modal'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

const renderModal = (
	openedModalId: string | null,
	setOpenedModalId: (modalId: string | null) => void
) => {
	const closeModal = () => setOpenedModalId(null)
	if (openedModalId === 'attack') return <AttackModal closeModal={closeModal} />
	return null
}

function equalCard(card1: CardT | null, card2: CardT | null): boolean {
	if (card1 === null || card2 === null) return false
	return (
		card1.cardId === card2.cardId && card1.cardInstance === card2.cardInstance
	)
}

type Props = {
	name: string
	gameType: 'stranger' | 'friend'
}
function Game(props: Props) {
	const gameState = useSelector((state: RootState) => state.gameState)
	const playerId = useSelector((state: RootState) => state.playerId)
	// select caard in players hand
	const [selectedCard, setSelectedCard] = useState<CardT | null>(null)
	const [openedModalId, setOpenedModalId] = useState<string | null>(null)
	const dispatch = useDispatch()

	if (!gameState) return <main>Loading</main>

	const playerState = gameState.players[playerId]

	const handleBoardClick = (meta: any) => {
		console.log('Slot selected: ', meta)
		if (!selectedCard) {
			const clickedOnHermit = meta.slotType === 'hermit' && meta.rowHermitCard
			if (clickedOnHermit) {
				if (playerState.board.activeRow === meta.rowIndex) {
					setOpenedModalId('attack')
				} else {
					dispatch({type: 'CHANGE_ACTIVE_HERMIT', payload: meta})
				}
			}
			return
		}
		const selectedCardInfo = TYPED_CARDS[selectedCard.cardId]
		if (!selectedCardInfo) {
			console.log('Unknown card id: ', selectedCard)
			return
		}
		if (meta.slotType === 'single_use') {
			if (selectedCardInfo.type !== 'single_use') return
			dispatch({type: 'PLAY_CARD', payload: {card: selectedCard}})
		} else {
			dispatch({type: 'PLAY_CARD', payload: {card: selectedCard, ...meta}})
		}

		setSelectedCard(null)
	}

	const selectCard = (card: CardT) => {
		console.log('Card selected: ', card.cardId)
		setSelectedCard((currentCard) =>
			equalCard(currentCard, card) ? null : card
		)
	}

	const playerHandJsx = playerState.hand.map((card) => {
		if (!TYPED_CARDS.hasOwnProperty(card.cardId)) {
			throw new Error('Unsupported card id: ' + card.cardId)
		}
		const cardInfo = TYPED_CARDS[card.cardId]
		return (
			<Card
				selected={equalCard(card, selectedCard)}
				key={card.cardInstance}
				card={cardInfo}
				onClick={() => selectCard(card)}
			/>
		)
	})

	return (
		<div className={css.game}>
			<Board onClick={handleBoardClick} gameState={gameState} />
			<div className={css.hand}>{playerHandJsx}</div>
			{renderModal(openedModalId, setOpenedModalId)}
		</div>
	)
}

export default Game
