import {useSelector, useDispatch} from 'react-redux'
import {RootState} from 'store'
import {CardT} from 'types/game-state'
import {PickProcessT} from 'types/pick-process'
import CardList from 'components/card-list'
import Board from './board'
import css from './game.module.css'
import AttackModal from './modals/attack-modal'
import ConfirmModal from './modals/confirm-modal'
import SpyglassModal from './modals/spyglass-modal'
import ChestModal from './modals/chest-modal'
import BorrowModal from './modals/borrow-modal'
import MouseIndicator from './mouse-indicator'

const getPickProcessMessage = (pickProcess: PickProcessT) => {
	const firstReq = pickProcess.requirments[0]
	const target = firstReq.target === 'opponent' ? "opponent's" : 'your'
	const location = firstReq.target === 'hand' ? 'hand' : 'side of the board'
	const type = firstReq.type === 'any' ? '' : firstReq.type
	const empty = firstReq.empty || false
	return `Pick ${firstReq.amount} ${empty ? 'empty' : ''} ${type} ${
		empty ? 'slot' : 'card'
	}${firstReq.amount > 1 ? 's' : ''} from ${target} ${location}.`
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
	else if (openedModalId === 'chest')
		return <ChestModal closeModal={closeModal} />
	else if (openedModalId === 'borrow')
		return <BorrowModal closeModal={closeModal} />
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

	const pickedCardsInstances = pickedCards.map((pickedCard) => pickedCard.card)

	return (
		<div className={css.game}>
			<Board onClick={handleBoardClick} gameState={gameState} />
			<div className={css.hand}>
				<CardList
					wrap={false}
					size="medium"
					cards={playerState.hand}
					onClick={(card: CardT) => selectCard(card)}
					selected={selectedCard}
					picked={pickedCardsInstances}
				/>
			</div>
			{renderModal(openedModalId, setOpenedModalId)}
			{pickProcess ? (
				<MouseIndicator message={getPickProcessMessage(pickProcess)} />
			) : null}
		</div>
	)
}

export default Game
