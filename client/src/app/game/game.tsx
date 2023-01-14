import React, {useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {RootState} from 'store'
import CARDS from 'server/cards'
import {CardT} from 'types/cards'
import Card from 'components/card'
import Board from './board'
import css from './game.module.css'
import AttackModal from './modals/attack-modal'

const TYPED_CARDS = CARDS as Record<string, CardT>

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
	const availableActions = useSelector(
		(state: RootState) => state.availableActions
	)
	const playerId = useSelector((state: RootState) => state.playerId)
	// select caard in players hand
	const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
	const [openedModalId, setOpenedModalId] = useState<string | null>(null)
	const dispatch = useDispatch()

	if (!gameState) return <main>Loading</main>

	const playerState = gameState.players[playerId]

	const playerHand = playerState.hand.map((cardId) => {
		if (!TYPED_CARDS.hasOwnProperty(cardId)) {
			throw new Error('Unsupported card id: ' + cardId)
		}
		return TYPED_CARDS[cardId]
	})

	const handleBoardClick = (meta: any) => {
		console.log('Slot selected: ', meta)
		if (!selectedCardId) {
			const clickedOnHermit = meta.slotType === 'hermit' && meta.hermitId
			if (clickedOnHermit) {
				if (playerState.board.activeRow === meta.rowIndex) {
					setOpenedModalId('attack')
				} else {
					dispatch({type: 'CHANGE_ACTIVE_HERMIT', payload: meta})
				}
			}
			return
		}
		dispatch({type: 'PLAY_CARD', payload: {cardId: selectedCardId, ...meta}})
		setSelectedCardId(null)
	}

	const endTurn = () => {
		dispatch({type: 'END_TURN'})
	}

	const selectCard = (cardId: string) => {
		console.log('Card selected: ', cardId)
		setSelectedCardId((currentCardId) =>
			currentCardId === cardId ? null : cardId
		)
	}

	const playerHandJsx = playerHand.map((card) => {
		// TODO - support duplicates (each individual card should have unique id)
		return (
			<Card
				selected={card.id === selectedCardId}
				key={card.id}
				card={card}
				onClick={() => selectCard(card.id)}
			/>
		)
	})

	return (
		<div className={css.game}>
			{availableActions.includes('END_TURN') ? (
				<button onClick={endTurn}>End Turn</button>
			) : null}
			<Board onClick={handleBoardClick} gameState={gameState} />
			<div className={css.hand}>{playerHandJsx}</div>
			{renderModal(openedModalId, setOpenedModalId)}
		</div>
	)
}

export default Game
