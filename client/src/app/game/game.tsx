import {useEffect, useRef, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {CardT} from 'common/types/game-state'
import {PickedSlotT} from 'common/types/pick-process'
import CardList from 'components/card-list'
import Board from './board'
import css from './game.module.scss'
import {
	AttackModal,
	BorrowModal,
	ChangeHermitModal,
	ChestModal,
	ConfirmModal,
	DiscardedModal,
	EndTurnModal,
	EvilXModal,
	ForfeitModal,
	LootingModal,
	SpyglassModal,
	UnmetConditionModal,
} from './modals'
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
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {setSetting} from 'logic/local-settings/local-settings-actions'

const MODAL_COMPONENTS: Record<string, React.FC<any>> = {
	attack: AttackModal,
	confirm: ConfirmModal,
	spyglass: SpyglassModal,
	chest: ChestModal,
	looting: LootingModal,
	borrow: BorrowModal,
	evilX: EvilXModal,
	'unmet-condition': UnmetConditionModal,
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
	const settings = useSelector(getSettings)
	const dispatch = useDispatch()
	const handRef = useRef<HTMLDivElement>(null)

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

	function handleKeys(e: any) {
		if (e.key === '/') {
			settings.showChat === 'off' && dispatch(setSetting('showChat', 'on'))
		}

		if (e.key === 'Escape') {
			dispatch(setSetting('showChat', 'off'))
		}
	}

	function handleResize() {
		if (!gameWrapperRef.current || !gameRef.current) return
		const scale = Math.min(
			gameWrapperRef.current.clientWidth / gameRef.current.clientWidth,
			gameWrapperRef.current.clientHeight / gameRef.current.clientHeight
		)
		setGameScale(scale)
	}

	function horizontalScroll(e: any) {
		const scrollSpeed = 45

		if (!handRef.current) return

		if (e.deltaY > 0) {
			e.preventDefault()
			handRef.current.scrollLeft += scrollSpeed
		} else {
			e.preventDefault()
			handRef.current.scrollLeft -= scrollSpeed
		}
	}

	// Play SFX on turn start
	useEffect(() => {
		if (gameState.currentPlayerId === gameState.playerId) {
			dispatch(playSound('/sfx/Click.ogg'))
		}
	}, [gameState.currentPlayerId])

	// Initialize Game Screen Resizing and Event Listeners
	useEffect(() => {
		handleResize()
		window.addEventListener('keyup', handleKeys)
		window.addEventListener('resize', handleResize)
		handRef.current?.addEventListener('wheel', horizontalScroll)

		// Clean up event listeners
		return () => {
			window.removeEventListener('keyup', handleKeys)
			window.removeEventListener('resize', handleResize)
			handRef.current?.removeEventListener('wheel', horizontalScroll)
		}
	}, [])

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
				<div className={css.hand} ref={handRef}>
					<CardList
						wrap={false}
						cards={gameState.hand}
						onClick={(card: CardT) => selectCard(card)}
						selected={[selectedCard]}
						picked={pickedSlotsInstances}
					/>
				</div>
			</div>

			{renderModal(openedModal, handleOpenModal)}
			<Chat />
			<EndGameOverlay {...endGameOverlay} />
		</div>
	)
}

export default Game
