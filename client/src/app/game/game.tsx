import {useSelector, useDispatch} from 'react-redux'
import {CardT} from 'common/types/game-state'
import {PickProcessT, PickedSlotT, SlotTypeT} from 'common/types/pick-process'
import CardList from 'components/card-list'
import Board from './board'
import css from './game.module.css'
import AttackModal from './modals/attack-modal'
import ConfirmModal from './modals/confirm-modal'
import SpyglassModal from './modals/spyglass-modal'
import LootingModal from './modals/looting-modal'
import ChestModal from './modals/chest-modal'
import BorrowModal from './modals/borrow-modal'
import EvilXModal from './modals/evil-x-modal'
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
import {getPlayerId} from 'logic/session/session-selectors'
import {setOpenedModal, setSelectedCard, slotPicked} from 'logic/game/game-actions'
import {CardTypeT} from 'common/types/cards'

const getFormattedList = (list: (CardTypeT | SlotTypeT)[]): string => {
	if (list.length === 1) {
		return list[0].replace(/_/g, ' ')
	}
	const formattedList = list.map((item) => item.replace(/_/g, ' '))
	const initialElements = formattedList.slice(0, -1).join(', ')
	return `${initialElements} or ${formattedList[formattedList.length - 1]}`
}

const getPickProcessMessage = (
	pickProcess: PickProcessT,
	currentPlayerId: string,
	yourPlayerId: string
) => {
	const req = pickProcess.requirments[pickProcess.currentReq]
	const amount = pickProcess.amount || req.amount

	// Workaround to get the correct target name for the player choosing a slot/card
	// This is needed because the current player may make the opposite player choose
	// a slot/card on follow up (e.g the Jingler) but techincally is still their turn
	// so we need to get the correct target name using another method
	let target
	if (req.target === 'player') {
		target = currentPlayerId === yourPlayerId ? 'your' : "opponent's"
	} else if (req.target === 'opponent') {
		target = currentPlayerId === yourPlayerId ? "opponent's" : 'your'
	} else {
		target = "anyone's"
	}

	let location =
		req.active === true ? 'active hermit' : req.active === false ? 'afk hermits' : 'hermits'

	if (req.slot[0] === 'hand' && req.slot.length === 1) {
		location = 'hand'
	}

	const adjacentMap = {
		active: 'active hermit',
		req: 'a previous pick',
	}
	const adjacentTarget = req.adjacent ? adjacentMap[req.adjacent] : ''

	let type = ''
	if (req.slot[0] !== 'hand') {
		type = getFormattedList(req.slot) + (req.amount > 1 ? ' slots' : ' slot')
	} else {
		type = req.amount > 1 ? ' cards' : ' card'
	}

	let cardType = ''
	if (req.type) {
		cardType = getFormattedList(req.type) + (req.amount > 1 ? ' cards' : ' card')
	}

	const empty = req.empty || false
	const adjacent = req.adjacent || false
	const name = pickProcess.name

	const article = ['item', 'effect'].includes(cardType[0]) ? 'an' : 'a'

	return `${name}: Pick ${amount} ${empty ? 'empty' : ''} ${type} ${
		adjacent ? 'adjacent to' : ''
	} ${adjacent ? adjacentTarget : ''} ${req.type ? 'with' : ''} ${
		cardType ? `${article} ${cardType}` : ''
	} from ${target} ${location}.`
}

const MODAL_COMPONENTS: Record<string, React.FC<any>> = {
	attack: AttackModal,
	confirm: ConfirmModal,
	spyglass: SpyglassModal,
	chest: ChestModal,
	looting: LootingModal,
	borrow: BorrowModal,
	evilX: EvilXModal,
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
	if (!openedModal || !Object.hasOwn(MODAL_COMPONENTS, openedModal.id)) return null

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
	const thisPlayerId = useSelector(getPlayerId)
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
		.map((pickedSlot) => pickedSlot.slot.card)
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
							selected={[selectedCard]}
							picked={pickedSlotsInstances}
						/>
					</div>
				</div>
				{renderModal(openedModal, handleOpenModal)}
				{pickProcess ? (
					<MouseIndicator
						message={getPickProcessMessage(pickProcess, gameState.currentPlayerId, thisPlayerId)}
					/>
				) : null}

				<Chat />

				{endGameOverlay && <EndGameOverlay {...endGameOverlay} />}
			</div>
		</div>
	)
}

export default Game
