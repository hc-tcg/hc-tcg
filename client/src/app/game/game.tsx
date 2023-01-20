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
import MouseIndicator from './mouse-indicator'
import {equalCard} from 'server/utils'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

const PICK_PROCESSES: Record<string, string> = {
	pick_afk: 'Select afk hermit to attack',
}

const renderModal = (
	openedModalId: string | null,
	setOpenedModalId: (modalId: string | null) => void
) => {
	const closeModal = () => setOpenedModalId(null)
	if (openedModalId === 'attack') return <AttackModal closeModal={closeModal} />
	return null
}

type Props = {
	name: string
	gameType: 'stranger' | 'friend'
}
function Game(props: Props) {
	const gameState = useSelector((state: RootState) => state.gameState)
	const playerId = useSelector((state: RootState) => state.playerId)
	const selectedCard = useSelector((state: RootState) => state.selectedCard)
	const openedModalId = useSelector((state: RootState) => state.openedModalId)
	const pickProcess = useSelector((state: RootState) => state.pickProcess)
	const dispatch = useDispatch()

	if (!gameState) return <main>Loading</main>

	const playerState = gameState.players[playerId]

	const setOpenedModalId = (id: string | null) => {
		dispatch({type: 'SET_OPENED_MODAL_ID', payload: id})
	}

	const handleBoardClick = (meta: any) => {
		console.log('Slot selected: ', meta)
		dispatch({type: 'SLOT_PICKED', payload: meta})
	}

	const selectCard = (card: CardT) => {
		console.log('Card selected: ', card.cardId)
		dispatch({type: 'SET_SELECTED_CARD', payload: card})
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
			{pickProcess ? (
				<MouseIndicator
					message={PICK_PROCESSES[pickProcess] || 'Unknown pick process'}
				/>
			) : null}
		</div>
	)
}

export default Game
