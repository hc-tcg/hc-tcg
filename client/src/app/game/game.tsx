import {useSelector, useDispatch} from 'react-redux'
import {CardT} from 'common/types/game-state'
import {PickProcessT, PickedSlotT} from 'common/types/pick-process'
import CardList from 'components/card-list'
import Board from './board'
import css from './game.module.css'
import AttackModal from './modals/attack-modal'
import ConfirmModal from './modals/confirm-modal'
import SpyglassModal from './modals/spyglass-modal'
import ChestModal from './modals/chest-modal'
import BorrowModal from './modals/borrow-modal'
import ChangeHermitModal from './modals/change-hermit-modal'
import ForfeitModal from './modals/forfeit-modal'
import UnmetCondition from './modals/unmet-condition-modal'
import EndTurnModal from './modals/end-turn-modal'
import DiscardedModal from './modals/discarded-modal'
import MouseIndicator from './mouse-indicator'
import EndGameOverlay from './end-game-overlay'
import Toolbar from './toolbar'
import Chat from './chat'
import {
	getGameState,
	getSelectedCard,
	getPickProcess,
	getOpenedModal,
	getPlayerState,
	getEndGameOverlay,
} from 'logic/game/game-selectors'
import {
	setOpenedModal,
	setSelectedCard,
	slotPicked,
} from 'logic/game/game-actions'

const getPickProcessMessage = (pickProcess: PickProcessT) => {
	const req = pickProcess.requirments[pickProcess.currentReq]
	const target =
		req.target === 'board'
			? "anyone's"
			: req.target === 'opponent'
			? "opponent's"
			: 'your'

	let location = ''
	if (req.target === 'hand') {
		location = 'hand'
	} else if (req.active === true) {
		location = 'active hermit'
	} else if (req.active === false) {
		location = 'afk hermits'
	} else {
		location = 'side of the board'
	}

	let adjacentTarget = ''
	if (req.adjacent === 'active') {
		adjacentTarget = 'active hermit'
	} else if (req.adjacent === 'req') {
		adjacentTarget = 'a previous pick'
	}

	let type = ''
	if (req.type.length === 1) {
		type = req.type[0]
	} else {
		// If there are more than one type, we want to display them as a list
		// separated by commas, with the last element separated by 'or'
		const initialElements = req.type.slice(0, -1)
		const commaSeparated = initialElements.join(', ')
		const lastElement = req.type[req.type.length - 1]

		type = `${commaSeparated} or ${lastElement}`
	}

	const empty = req.empty || false
	const adjacent = req.adjacent || false
	const name = pickProcess.name
	return `${name}: Pick ${req.amount} ${empty ? 'empty' : ''} ${type} ${
		empty ? 'slot' : 'card'
	}${req.amount > 1 ? 's' : ''} ${adjacent ? 'adjacent to' : ''} ${
		adjacent ? adjacentTarget : ''
	} from ${target} ${location}.`
}

const MODAL_COMPONENTS: Record<string, React.FC<any>> = {
	attack: AttackModal,
	confirm: ConfirmModal,
	spyglass: SpyglassModal,
	chest: ChestModal,
	borrow: BorrowModal,
	'unmet-condition': UnmetCondition,
	'change-hermit-modal': ChangeHermitModal,
	'end-turn': EndTurnModal,
	discarded: DiscardedModal,
	forfeit: ForfeitModal,
}

const renderModal = (
	openedModal: {id: string; info: any} | null,
	handleOpenModalId: (modalId: string | null) => void
) => {
	const closeModal = () => handleOpenModalId(null)
	if (!openedModal || !Object.hasOwn(MODAL_COMPONENTS, openedModal.id))
		return null

	const ModalComponent = MODAL_COMPONENTS[openedModal.id]
	return <ModalComponent closeModal={closeModal} info={openedModal.info} />
}

function Game() {
	const gameState = useSelector(getGameState)
	const selectedCard = useSelector(getSelectedCard)
	const pickedSlots = useSelector(getPickProcess)?.pickedSlots || []
	const openedModal = useSelector(getOpenedModal)
	const pickProcess = useSelector(getPickProcess)
	const playerState = useSelector(getPlayerState)
	const endGameOverlay = useSelector(getEndGameOverlay)
	const dispatch = useDispatch()

	if (!gameState || !playerState) return <main>Loading</main>

	const handleOpenModal = (id: string | null) => {
		dispatch(setOpenedModal(id))
	}

	const handleBoardClick = (pickedSlot: PickedSlotT) => {
		console.log('Slot selected: ', pickedSlot)
		dispatch(slotPicked(pickedSlot))
	}

	const selectCard = (card: CardT) => {
		console.log('Card selected: ', card.cardId)
		dispatch(setSelectedCard(card))
	}

	const pickedSlotsInstances = pickedSlots
		.map((pickedSlot) => pickedSlot.card)
		.filter(Boolean) as Array<CardT>

	return (
		<div className={css.game}>
			<div className={css.innerGame}>
				<Board onClick={handleBoardClick} localGameState={gameState} />
				<div className={css.bottom}>
					<div className={css.toolbar}>
						<Toolbar />
					</div>
					<div className={css.hand}>
						<CardList
							wrap={false}
							size="medium"
							cards={gameState.hand}
							onClick={(card: CardT) => selectCard(card)}
							selected={selectedCard}
							picked={pickedSlotsInstances}
						/>
					</div>
				</div>
				{renderModal(openedModal, handleOpenModal)}
				{pickProcess ? (
					<MouseIndicator message={getPickProcessMessage(pickProcess)} />
				) : null}

				<Chat />

				{endGameOverlay && <EndGameOverlay {...endGameOverlay} />}
			</div>
		</div>
	)
}

export default Game
