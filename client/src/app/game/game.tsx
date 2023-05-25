import {useEffect, useRef, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {CardT} from 'common/types/game-state'
import {PickedSlotT} from 'common/types/pick-process'
import CardList from 'components/card-list'
import Board from './board'
import css from './game.module.scss'
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
import EndGameOverlay from './end-game-overlay'
import Toolbar from './toolbar'
import Chat from './chat'
import {playSound} from 'logic/sound/sound-actions'
import {
	getGameState,
	getSelectedCard,
	getPickProcess,
	getOpenedModal,
	getPlayerState,
	getEndGameOverlay,
} from 'logic/game/game-selectors'
import {setOpenedModal, setSelectedCard, slotPicked} from 'logic/game/game-actions'

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
	const playerState = useSelector(getPlayerState)
	const endGameOverlay = useSelector(getEndGameOverlay)
	const dispatch = useDispatch()

	if (!gameState || !playerState) return <p>Loading</p>
	const [gameScale, setGameScale] = useState<number>(1)

	const pickedSlotsInstances = pickedSlots
		.map((pickedSlot) => pickedSlot.slot.card)
		.filter(Boolean) as Array<CardT>

	const gameWrapperRef = useRef<HTMLDivElement>(null)
	const gameRef = useRef<HTMLDivElement>(null)

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

	// Play SFX on turn start
	useEffect(() => {
		if (gameState.currentPlayerId === gameState.playerId) {
			dispatch(playSound('/sfx/Click.ogg'))
		}
	}, [gameState.currentPlayerId])

	// Begin resizing
	useEffect(() => {
		// Begin resize on page load
		handleResize()
	}, [])
	function handleResize() {
		if (!gameWrapperRef.current || !gameRef.current) return
		const scale = Math.min(
			gameWrapperRef.current.clientWidth / gameRef.current.clientWidth,
			gameWrapperRef.current.clientHeight / gameRef.current.clientHeight
		)
		setGameScale(scale)
	}
	window.addEventListener('resize', handleResize)
	// End resizing

	return (
		<div className={css.game}>
			<div className={css.playAreaWrapper} ref={gameWrapperRef}>
				<div className={css.playArea} ref={gameRef} style={{transform: `scale(${gameScale})`}}>
					<div className={css.grid} />
					<Board onClick={handleBoardClick} localGameState={gameState} />
				</div>
			</div>

			<div className={css.bottom}>
				<Toolbar />
				<div className={css.hand}>
					<CardList
						wrap={false}
						size="game"
						cards={gameState.hand}
						onClick={(card: CardT) => selectCard(card)}
						selected={[selectedCard]}
						picked={pickedSlotsInstances}
					/>
				</div>
			</div>

			{renderModal(openedModal, handleOpenModal)}

			<Chat />

			{endGameOverlay && <EndGameOverlay {...endGameOverlay} />}
		</div>
	)
}

export default Game
