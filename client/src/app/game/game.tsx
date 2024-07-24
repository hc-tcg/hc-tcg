import {useEffect, useRef, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import CardList from 'components/card-list'
import Board from './board'
import css from './game.module.scss'
import {
	AttackModal,
	ChangeHermitModal,
	ConfirmModal,
	EndTurnModal,
	ForfeitModal,
	SelectCardsModal,
	UnmetConditionModal,
} from './modals'
import EndGameOverlay from './end-game-overlay'
import Toolbar from './toolbar'
import Chat from './chat'
import {playSound} from 'logic/sound/sound-actions'
import {
	getGameState,
	getSelectedCard,
	getOpenedModal,
	getPlayerState,
	getEndGameOverlay,
	getAvailableActions,
	getPickRequestPickableSlots,
} from 'logic/game/game-selectors'
import {setOpenedModal, setSelectedCard, slotPicked} from 'logic/game/game-actions'
import {DEBUG_CONFIG} from 'common/config'
import {PickSlotActionData} from 'common/types/action-data'
import {equalCard} from 'common/utils/cards'
import CopyAttackModal from './modals/copy-attack-modal'
import {LocalCardInstance, SlotInfo} from 'common/types/server-requests'
import {PlayerEntity} from 'common/entities'
import {setSetting} from 'logic/local-settings/local-settings-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'

const MODAL_COMPONENTS: Record<string, React.FC<any>> = {
	attack: AttackModal,
	confirm: ConfirmModal,
	forfeit: ForfeitModal,
	'change-hermit-modal': ChangeHermitModal,
	'end-turn': EndTurnModal,
	'unmet-condition': UnmetConditionModal,

	// Custom modals
	copyAttack: CopyAttackModal,
	selectCards: SelectCardsModal,
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
	const availableActions = useSelector(getAvailableActions)
	const selectedCard = useSelector(getSelectedCard)
	const openedModal = useSelector(getOpenedModal)
	const playerState = useSelector(getPlayerState)
	const endGameOverlay = useSelector(getEndGameOverlay)
	const pickRequestPickableSlots = useSelector(getPickRequestPickableSlots)
	const settings = useSelector(getSettings)
	const dispatch = useDispatch()
	const handRef = useRef<HTMLDivElement>(null)
	const [filter, setFilter] = useState<string>('')

	if (!gameState || !playerState) return <p>Loading</p>
	const [gameScale, setGameScale] = useState<number>(1)
	const filteredCards = DEBUG_CONFIG.unlimitedCards
		? gameState.hand.filter((c) => c.props.name.toLowerCase().includes(filter.toLowerCase()))
		: gameState.hand

	const gameWrapperRef = useRef<HTMLDivElement>(null)
	const gameRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		window.addEventListener('keydown', handleKeys)
		return () => {
			window.removeEventListener('keydown', handleKeys)
		}
	}, [handleKeys])

	const handleOpenModal = (id: string | null) => {
		dispatch(setOpenedModal(id))
	}

	const handleBoardClick = (
		pickInfo: SlotInfo,
		player: PlayerEntity,
		row?: number,
		index?: number
	) => {
		console.log('Slot selected: ', pickInfo)

		// This is a hack to make picked cards appear
		dispatch(slotPicked(pickInfo, player, row, index))
	}

	const selectCard = (card: LocalCardInstance) => {
		if (availableActions.includes('PICK_REQUEST')) {
			const index = gameState.hand.findIndex((c) => equalCard(c, card))
			if (index === -1) return
			if (card.slot === null) return

			// Send pick card action with the hand info
			const actionData: PickSlotActionData = {
				type: 'PICK_REQUEST',
				payload: {
					entity: card.slot,
				},
			}

			dispatch(actionData)
		} else {
			if (equalCard(card, selectedCard)) {
				dispatch(setSelectedCard(null))
			} else {
				console.log('Selecting card:', card)
				dispatch(setSelectedCard(card))
			}
		}
	}

	if (availableActions.includes('PICK_REQUEST')) {
		dispatch(setSelectedCard(null))
	}

	function handleKeys(e: any) {
		const chatIsClosed = settings.showChat === 'off'

		if (e.key === 'Escape') {
			dispatch(setSetting('showChat', 'off'))
		}

		if (e.key === 'c' || e.key === 'C') {
			// We do not do anything if the chat is opened because then you couldn't type the C key.
			// Users can still use ESC to close the window.
			if (chatIsClosed) {
				e.stopImmediatePropagation()
				e.preventDefault()
				dispatch(setSetting('showChat', 'on'))
			}
		}

		if (chatIsClosed) {
			if (e.key === 'a' || e.key === 'A') {
				dispatch(setOpenedModal('attack'))
			}
			if (e.key === 'e' || e.key === 'E') {
				if (availableActions.includes('END_TURN')) dispatch(setOpenedModal('end-turn'))
			}
			if (e.key === 'm' || e.key === 'M') {
				dispatch(setSetting('muted', !settings.muted))
			}
			if (e.key === 'h' || e.key === 'H') {
				dispatch(
					setSetting('showAdvancedTooltips', settings.showAdvancedTooltips === 'on' ? 'off' : 'on')
				)
			}
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

	// Play SFX on turn start or when the player enters a game
	useEffect(() => {
		if (gameState.turn.turnNumber === 1 || gameState.turn.currentPlayerId === gameState.playerId) {
			dispatch(playSound('/sfx/Click.ogg'))
		}
	}, [gameState.turn.currentPlayerId])

	// Play sound on custom modal or pick request activation
	useEffect(() => {
		const someCustom = gameState.currentPickMessage || gameState.currentModalData
		if (someCustom && gameState.turn.currentPlayerId !== gameState.playerId) {
			dispatch(playSound('/sfx/Click.ogg'))
		}
	}, [gameState.currentPickMessage, gameState.currentModalData])

	// Initialize Game Screen Resizing and Event Listeners
	useEffect(() => {
		handleResize()
		// window.addEventListener('keyup', handleKeys)
		window.addEventListener('resize', handleResize)
		handRef.current?.addEventListener('wheel', horizontalScroll)

		// Clean up event listeners
		return () => {
			// window.removeEventListener('keyup', handleKeys)
			window.removeEventListener('resize', handleResize)
			handRef.current?.removeEventListener('wheel', horizontalScroll)
		}
	}, [])

	// Search for cards when debug.unlimitedCards is enabled
	const Filter = () => {
		if (DEBUG_CONFIG.unlimitedCards) {
			return (
				<input
					type="text"
					placeholder="Search for cards..."
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
				/>
			)
		}
		return null
	}

	let unpickableCards: Array<LocalCardInstance> = []
	const pickableCards = pickRequestPickableSlots

	if (pickableCards != undefined) {
		for (let card of filteredCards) {
			if (card.slot && !pickableCards.includes(card.slot)) unpickableCards.push(card)
		}
	}

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
					{Filter()}
					<CardList
						wrap={false}
						cards={filteredCards}
						onClick={(card: LocalCardInstance) => selectCard(card)}
						selected={[selectedCard]}
						unpickable={unpickableCards}
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
