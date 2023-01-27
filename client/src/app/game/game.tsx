import React, {useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {RootState} from 'store'
import CARDS from 'server/cards'
import {CardInfoT} from 'types/cards'
import {CardT} from 'types/game-state'
import {PickProcessT} from 'types/pick-process'
import Card from 'components/card'
import Board from './board'
import css from './game.module.css'
import AttackModal from './modals/attack-modal'
import ConfirmModal from './modals/confirm-modal'
import SpyglassModal from './modals/spyglass-modal'
import MouseIndicator from './mouse-indicator'
import {equalCard} from 'server/utils'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

const PICK_PROCESSES: Record<string, string> = {
	afk_opponent_hermit: 'Select afk hermit to attack',
	any_player_hermit: 'Select one of your hermits to apply the effect',
	any_opponent_hermit: "Select one of opponent's hermits to apply the effect",
}

const getPickProcessMessage = (pickProcess: PickProcessT) => {
	const firstReq = pickProcess.requirments[0]
	const target = firstReq.target === 'opponent' ? "opponent's" : 'your'
	const location = firstReq.target === 'hand' ? 'hand' : 'side of the board'
	const type = firstReq.type === 'any' ? '' : firstReq.type
	return `Pick ${firstReq.amount} ${type} card${
		firstReq.amount > 1 ? 's' : ''
	} from ${target} ${location}.`
}

type ClickInfoT =
	| {
			slotType: 'single_use'
			card: CardT | null
	  }
	| {
			slotType: 'item' | 'hermit' | 'effect' | 'health'
			playerId: string
			rowIndex: number
			rowHermitCard: CardT | null
			slotIndex: number
			card: CardT | null
	  }

const renderModal = (
	openedModalId: string | null,
	setOpenedModalId: (modalId: string | null) => void
) => {
	const closeModal = () => setOpenedModalId(null)
	if (openedModalId === 'attack') return <AttackModal closeModal={closeModal} />
	else if (openedModalId === 'confirm')
		return <ConfirmModal closeModal={closeModal} />
	else if (openedModalId === 'spyglass')
		return <SpyglassModal closeModal={closeModal} />
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
	const pickedCards = useSelector(
		(state: RootState) => state.pickProcess?.pickedCards || []
	)
	const openedModalId = useSelector((state: RootState) => state.openedModalId)
	const pickProcess = useSelector((state: RootState) => state.pickProcess)
	const dispatch = useDispatch()

	if (!gameState) return <main>Loading</main>

	const playerState = gameState.players[playerId]

	const setOpenedModalId = (id: string | null) => {
		dispatch({type: 'SET_OPENED_MODAL_ID', payload: id})
	}

	const handleBoardClick = (meta: ClickInfoT) => {
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
		const isPicked = pickedCards.some((pickedCard) =>
			equalCard(card, pickedCard.card)
		)
		return (
			<Card
				picked={isPicked}
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
				<MouseIndicator message={getPickProcessMessage(pickProcess)} />
			) : null}
		</div>
	)
}

export default Game
