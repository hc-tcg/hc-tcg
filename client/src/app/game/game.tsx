import {DEBUG_CONFIG} from 'common/config'
import {PlayerEntity} from 'common/entities'
import {LocalCardInstance, SlotInfo} from 'common/types/server-requests'
import {equalCard} from 'common/utils/cards'
import CardList from 'components/card-list'
import {
	getAvailableActions,
	getEndGameOverlay,
	getGameState,
	getIsSpectator,
	getOpenedModal,
	getPickRequestPickableSlots,
	getPlayerEntity,
	getPlayerState,
	getSelectedCard,
} from 'logic/game/game-selectors'
import {
	MODAL_COMPONENTS,
	ModalVariant,
} from 'logic/game/tasks/action-modals-saga'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useEffect, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import Board from './board'
import Chat from './chat'
import EndGameOverlay from './end-game-overlay'
import css from './game.module.scss'
import Toolbar from './toolbar'

const renderModal = (
	openedModal: {id: ModalVariant; info: any} | null,
	handleOpenModalId: (modalId: ModalVariant | null) => void,
) => {
	const closeModal = () => handleOpenModalId(null)
	if (!openedModal || !Object.hasOwn(MODAL_COMPONENTS, openedModal.id))
		return null

	const ModalComponent = MODAL_COMPONENTS[openedModal.id] as any
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
	const dispatch = useMessageDispatch()
	const handRef = useRef<HTMLDivElement>(null)
	const playerEntity = useSelector(getPlayerEntity)
	const isSpectator = useSelector(getIsSpectator)
	const [filter, setFilter] = useState<string>('')

	if (!gameState || !playerState) return <p>Loading</p>
	const [gameScale, setGameScale] = useState<number>(1)
	const filteredCards = DEBUG_CONFIG.unlimitedCards
		? gameState.hand.filter((c) =>
				c.props.name.toLowerCase().includes(filter.toLowerCase()),
			)
		: gameState.hand

	const gameWrapperRef = useRef<HTMLDivElement>(null)
	const gameRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		window.addEventListener('keydown', handleKeys)
		return () => {
			window.removeEventListener('keydown', handleKeys)
		}
	}, [handleKeys])

	const handleOpenModal = (id: ModalVariant | null) => {
		dispatch({type: localMessages.GAME_MODAL_OPENED_SET, id: id})
	}

	const handleBoardClick = (
		slotInfo: SlotInfo,
		player: PlayerEntity,
		row?: number,
		index?: number,
	) => {
		console.log('Slot selected: ', slotInfo)
		dispatch({
			type: localMessages.GAME_SLOT_PICKED,
			slotInfo,
			player,
			row,
			index,
		})
	}

	const selectCard = (card: LocalCardInstance) => {
		if (availableActions.includes('PICK_REQUEST')) {
			const index = gameState.hand.findIndex((c) => equalCard(c, card))
			if (index === -1) return
			if (card.slot === null) return

			// Send pick card action with the hand info
			dispatch({
				type: localMessages.GAME_TURN_ACTION,
				action: {
					type: 'PICK_REQUEST',
					entity: card.slot,
				},
			})
		} else {
			if (equalCard(card, selectedCard)) {
				dispatch({type: localMessages.GAME_CARD_SELECTED_SET, card: null})
			} else {
				console.log('Selecting card:', card)
				dispatch({type: localMessages.GAME_CARD_SELECTED_SET, card})
			}
		}
	}

	if (availableActions.includes('PICK_REQUEST')) {
		dispatch({type: localMessages.GAME_CARD_SELECTED_SET, card: null})
	}

	function handleKeys(e: any) {
		if (e.key === 'Escape') {
			dispatch({
				type: localMessages.SETTINGS_SET,
				setting: {
					key: 'showChatWindow',
					value: false,
				},
			})
		}

		if (e.key === 'c' || e.key === 'C') {
			// We do not do anything if the chat is opened because then you couldn't type the C key.
			// Users can still use ESC to close the window.
			if (!settings.showChatWindow) {
				e.stopImmediatePropagation()
				e.preventDefault()
				dispatch({
					type: localMessages.SETTINGS_SET,
					setting: {
						key: 'showChatWindow',
						value: true,
					},
				})
			}
		}

		if (!settings.showChatWindow) {
			if (e.key === 'a' || e.key === 'A') {
				dispatch({type: localMessages.GAME_MODAL_OPENED_SET, id: 'attack'})
			}
			if (e.key === 'e' || e.key === 'E') {
				if (availableActions.includes('END_TURN')) {
					dispatch({type: localMessages.GAME_ACTIONS_END_TURN})
				}
			}
			if (e.key === 'm' || e.key === 'M') {
				dispatch({
					type: localMessages.SETTINGS_SET,
					setting: {
						key: 'muted',
						value: !settings.muted,
					},
				})
			}
			if (e.key === 't' || e.key === 'T') {
				dispatch({
					type: localMessages.SETTINGS_SET,
					setting: {
						key: 'showAdvancedTooltips',
						value: !settings.showAdvancedTooltips,
					},
				})
			}
		}
	}

	function handleResize() {
		if (!gameWrapperRef.current || !gameRef.current) return
		const scale = Math.min(
			gameWrapperRef.current.clientWidth / gameRef.current.clientWidth,
			gameWrapperRef.current.clientHeight / gameRef.current.clientHeight,
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
		if (
			gameState.turn.turnNumber === 1 ||
			gameState.turn.currentPlayerEntity === gameState.playerEntity
		) {
			dispatch({type: localMessages.SOUND_PLAY, path: '/sfx/Click.ogg'})
		}
	}, [gameState.turn.currentPlayerEntity])

	// Play sound on custom modal or pick request activation
	useEffect(() => {
		const someCustom =
			gameState.currentPickMessage || gameState.currentModalData
		if (
			someCustom &&
			gameState.turn.currentPlayerEntity !== gameState.playerEntity
		) {
			dispatch({type: localMessages.SOUND_PLAY, path: '/sfx/Click.ogg'})
		}
	}, [gameState.currentPickMessage, gameState.currentModalData])

	// Play EX voice lines on hermit deaths and game end
	const lives = [gameState.playerEntity, gameState.opponentPlayerEntity].map(
		(id) => gameState.players[id].lives,
	)
	const [prevLives, setPrevLives] = useState(lives)
	useEffect(() => {
		if (!gameState.isBossGame) return
		if (endGameOverlay) {
			if (
				endGameOverlay.outcome.type === 'player-won' &&
				endGameOverlay.outcome.winner === playerEntity
			)
				dispatch({
					type: localMessages.QUEUE_VOICE,
					lines: ['/voice/EXLOSE.ogg'],
				})
			else
				dispatch({
					type: localMessages.QUEUE_VOICE,
					lines: ['/voice/PLAYERLOSE.ogg'],
				})
			return
		}
		const playerLostLife = lives[0] - prevLives[0] < 0
		const opponentLostLife = lives[1] - prevLives[1] < 0
		setPrevLives(lives)
		if (opponentLostLife) {
			dispatch({type: localMessages.QUEUE_VOICE, lines: ['/voice/EXLIFE.ogg']})
		} else if (playerLostLife) {
			dispatch({
				type: localMessages.QUEUE_VOICE,
				lines: ['/voice/PLAYERLIFE.ogg'],
			})
		}
	}, [...lives, endGameOverlay])

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
			if (card.slot && !pickableCards.includes(card.slot))
				unpickableCards.push(card)
		}
	}

	return (
		<div className={css.game}>
			<div className={css.playAreaWrapper} ref={gameWrapperRef}>
				<div
					className={css.playArea}
					ref={gameRef}
					style={{transform: `scale(${gameScale})`}}
				>
					<div className={css.grid} />
					<Board onClick={handleBoardClick} localGameState={gameState} />
				</div>
			</div>

			<div className={css.bottom}>
				<Toolbar />
				{!isSpectator && (
					<div className={css.hand} ref={handRef}>
						{Filter()}
						<CardList
							wrap={false}
							displayTokenCost={false}
							cards={filteredCards}
							onClick={(card: LocalCardInstance) => selectCard(card)}
							selected={[selectedCard]}
							unpickable={unpickableCards}
							statusEffects={gameState.statusEffects}
						/>
					</div>
				)}
			</div>

			{renderModal(openedModal, handleOpenModal)}
			<Chat />

			{endGameOverlay?.outcome && (
				<EndGameOverlay
					{...endGameOverlay}
					nameOfWinner={
						endGameOverlay.outcome.type === 'player-won'
							? gameState.players[endGameOverlay.outcome.winner].playerName
							: null
					}
					nameOfLoser={
						endGameOverlay.outcome.type === 'player-won'
							? gameState.players[
									Object.keys(gameState.players).find(
										(k) =>
											endGameOverlay.outcome.type === 'player-won' &&
											k !== endGameOverlay.outcome.winner,
									) as PlayerEntity
								].playerName
							: null
					}
					viewer={
						isSpectator
							? {type: 'spectator'}
							: {type: 'player', entity: playerEntity}
					}
					onClose={() => {
						dispatch({type: localMessages.GAME_END_OVERLAY_HIDE})
					}}
				/>
			)}
		</div>
	)
}

export default Game
