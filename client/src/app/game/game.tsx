import {useSelector, useDispatch} from 'react-redux'
import {CardT} from 'types/game-state'
import {PickProcessT, PickedCardT} from 'types/pick-process'
import CardList from 'components/card-list'
import Board from './board'
import css from './game.module.css'
import AttackModal from './modals/attack-modal'
import ConfirmModal from './modals/confirm-modal'
import SpyglassModal from './modals/spyglass-modal'
import ChestModal from './modals/chest-modal'
import BorrowModal from './modals/borrow-modal'
import MouseIndicator from './mouse-indicator'
import {
	getGameState,
	getSelectedCard,
	getPickProcess,
	getOpenedModalId,
	getPlayerState,
} from 'logic/game/game-selectors'
import {
	setOpenedModalId,
	setSelectedCard,
	slotPicked,
	forfeit,
} from 'logic/game/game-actions'

const getPickProcessMessage = (pickProcess: PickProcessT) => {
	const firstReq = pickProcess.requirments[pickProcess.pickedCards.length]
	const target = firstReq.target === 'opponent' ? "opponent's" : 'your'
	const location = firstReq.target === 'hand' ? 'hand' : 'side of the board'
	const type = firstReq.type === 'any' ? '' : firstReq.type
	const empty = firstReq.empty || false
	return `${pickProcess.id}: Pick ${firstReq.amount} ${
		empty ? 'empty' : ''
	} ${type} ${empty ? 'slot' : 'card'}${
		firstReq.amount > 1 ? 's' : ''
	} from ${target} ${location}.`
}

const renderModal = (
	openedModalId: string | null,
	handleOpenModalId: (modalId: string | null) => void
) => {
	const closeModal = () => handleOpenModalId(null)
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

type Props = {}
function Game(props: Props) {
	const gameState = useSelector(getGameState)
	const selectedCard = useSelector(getSelectedCard)
	// TODO - this used to be array
	const pickedCards = useSelector(getPickProcess)?.pickedCards || []
	const openedModalId = useSelector(getOpenedModalId)
	const pickProcess = useSelector(getPickProcess)
	const playerState = useSelector(getPlayerState)
	const dispatch = useDispatch()

	if (!gameState || !playerState) return <main>Loading</main>

	const handleOpenModalId = (id: string | null) => {
		dispatch(setOpenedModalId(id))
	}

	const handleBoardClick = (pickedCard: PickedCardT) => {
		console.log('Slot selected: ', pickedCard)
		dispatch(slotPicked(pickedCard))
	}

	const selectCard = (card: CardT) => {
		console.log('Card selected: ', card.cardId)
		dispatch(setSelectedCard(card))
	}

	const handleForfeit = () => {
		dispatch(forfeit())
	}

	const pickedCardsInstances = pickedCards
		.map((pickedCard) => pickedCard.card)
		.filter(Boolean) as Array<CardT>

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
			{renderModal(openedModalId, handleOpenModalId)}
			{pickProcess ? (
				<MouseIndicator message={getPickProcessMessage(pickProcess)} />
			) : null}

			<div className={css.forfeit} onClick={handleForfeit}>
				<img
					src="https://static.wikia.nocookie.net/minecraft_gamepedia/images/3/38/White_Banner_Revision_1.png"
					width="32"
					title="Forfeit"
				/>
			</div>
		</div>
	)
}

export default Game
