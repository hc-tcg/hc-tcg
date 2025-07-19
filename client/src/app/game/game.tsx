import cn from 'classnames'
import {CARDS} from 'common/cards'
import {CONFIG} from 'common/config'
import {PlayerEntity} from 'common/entities'
import {LocalCardInstance, SlotInfo} from 'common/types/server-requests'
import {equalCard} from 'common/utils/cards'
import CardList from 'components/card-list'
import {
	getAvailableActions,
	getCurrentModalData,
	getCurrentPickMessage,
	getCurrentPlayerEntity,
	getEndGameOverlay,
	getGameState,
	getIsReplayer,
	getIsSpectator,
	getOpenedModal,
	getPickRequestPickableSlots,
	getPlayerEntity,
	getPlayerState,
	getSelectedCard,
	getSpectatorCodeInGame,
	getTurnNumber,
} from 'logic/game/game-selectors'
import {
	MODAL_COMPONENTS,
	ModalVariant,
} from 'logic/game/tasks/action-modals-saga'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {getRematchData} from 'logic/session/session-selectors'
import {useEffect, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'store'
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

function ModalContainer() {
	const openedModal = useSelector(getOpenedModal)
	const dispatch = useMessageDispatch()

	const handleOpenModal = (id: ModalVariant | null) => {
		dispatch({type: localMessages.GAME_MODAL_OPENED_SET, id: id})
	}

	return renderModal(openedModal, handleOpenModal)
}

type EndGameOverlayProps = {
	modalVisible: boolean
	setModalVisible: (visible: boolean) => void
	setMenuSection: (section: string) => void
}

function EndGameOverlayContainer({
	modalVisible,
	setModalVisible,
	setMenuSection,
}: EndGameOverlayProps) {
	const endGameOverlay = useSelector(getEndGameOverlay)
	const gameState = useSelector(getGameState)
	const isSpectator = useSelector(getIsSpectator)
	const playerEntity = useSelector(getPlayerEntity)
	const dispatch = useMessageDispatch()
	const rematchData = useSelector(getRematchData)
	const spectatorCode = useSelector(getSpectatorCodeInGame)

	// Play EX voice lines on hermit deaths and game end
	const lives = [gameState?.playerEntity, gameState?.opponentPlayerEntity].map(
		(id) => (id && gameState?.players[id].lives) || 0,
	)
	const [prevLives, setPrevLives] = useState(lives)
	useEffect(() => {
		if (!gameState) return
		if (!gameState.isEvilXBossGame) return
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

	if (!gameState || !endGameOverlay?.outcome || !modalVisible) return null

	return (
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
			rematchData={rematchData}
			onClose={() => setModalVisible(false)}
			setMenuSection={setMenuSection}
			dispatchGameClose={() => {
				dispatch({type: localMessages.GAME_CLOSE})
			}}
			gameMode={
				gameState.isEvilXBossGame
					? 'boss'
					: spectatorCode
						? 'private'
						: 'public'
			}
		/>
	)
}

function Hand({gameOver}: {gameOver: boolean}) {
	const gameState = useSelector(getGameState)
	if (!gameState) return null

	const handRef = useRef<HTMLDivElement>(null)
	const availableActions = useSelector(getAvailableActions)
	const pickRequestPickableSlots = useSelector(getPickRequestPickableSlots)
	const [filter, setFilter] = useState<string>('')
	const pickableCards = pickRequestPickableSlots
	const selectedCard = useSelector(getSelectedCard)
	const isReplayer = useSelector(getIsReplayer)

	const dispatch = useMessageDispatch()

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

	useEffect(() => {
		handRef.current?.addEventListener('wheel', horizontalScroll)
		return () => {
			handRef.current?.removeEventListener('wheel', horizontalScroll)
		}
	}, [])

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

	const filteredCards = CONFIG.game.unlimitedCards
		? gameState.hand.filter((c) =>
				CARDS[c.id].name.toLowerCase().includes(filter.toLowerCase()),
			)
		: gameState.hand

	// Search for cards when debug.unlimitedCards is enabled
	const Filter = () => {
		if (CONFIG.game.unlimitedCards) {
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

	if (pickableCards != undefined) {
		for (let card of filteredCards) {
			if (isReplayer || (card.slot && !pickableCards.includes(card.slot)))
				unpickableCards.push(card)
		}
	}

	return (
		<div className={cn(css.hand, {[css.noHover]: gameOver})} ref={handRef}>
			{Filter()}
			<CardList
				wrap={false}
				displayTokenCost={false}
				cards={filteredCards}
				onClick={
					!isReplayer || !gameOver
						? (card: LocalCardInstance) => selectCard(card)
						: undefined
				}
				selected={[selectedCard]}
				unpickable={unpickableCards}
				statusEffects={gameState.statusEffects}
			/>
		</div>
	)
}

function RequiresAvaiableActions() {
	const dispatch = useMessageDispatch()
	const availableActions = useSelector(getAvailableActions)
	const settings = useSelector(getSettings)

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
						key: 'globalVolume',
						value: settings.globalVolume === 0 ? settings.globalVolumeStore : 0,
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

	useEffect(() => {
		window.addEventListener('keydown', handleKeys)
		return () => {
			window.removeEventListener('keydown', handleKeys)
		}
	}, [handleKeys])

	return null
}

function PickRequestSound() {
	const currentPlayerEntity = useSelector(getCurrentPlayerEntity)
	const playerEntity = useSelector(getPlayerEntity)
	const currentPickMessage = useSelector(getCurrentPickMessage)
	const currentModalData = useSelector(getCurrentModalData)
	const dispatch = useMessageDispatch()

	// Play sound on custom modal or pick request activation
	useEffect(() => {
		const someCustom = currentPickMessage || currentModalData
		if (someCustom && currentPlayerEntity !== playerEntity) {
			dispatch({type: localMessages.SOUND_PLAY, path: '/sfx/Click.ogg'})
		}
	}, [currentPickMessage, currentModalData])

	return null
}

function TurnStartSound() {
	const turnNumber = useSelector(getTurnNumber)
	const playerEntity = useSelector(getPlayerEntity)
	const currentPlayerEntity = useSelector(getCurrentPlayerEntity)
	const dispatch = useMessageDispatch()

	// Play SFX on turn start or when the player enters a game
	useEffect(() => {
		if (turnNumber === 1 || currentPlayerEntity === playerEntity) {
			dispatch({type: localMessages.SOUND_PLAY, path: '/sfx/Click.ogg'})
		}
	}, [currentPlayerEntity])

	return null
}

function Game({setMenuSection}: {setMenuSection: (section: string) => void}) {
	const gameEndState = useSelector(getEndGameOverlay)
	const hasPlayerState = useSelector(
		(root: RootState) => getPlayerState(root) !== null,
	)
	const dispatch = useMessageDispatch()
	const isSpectator = useSelector(getIsSpectator)
	const isReplayer = useSelector(getIsReplayer)

	if (!hasPlayerState) return <p>Loading</p>
	const [gameScale, setGameScale] = useState<number>(1)
	const [gameEndModal, setGameEndModal] = useState<boolean>(true)
	const gameWrapperRef = useRef<HTMLDivElement>(null)
	const gameRef = useRef<HTMLDivElement>(null)

	const gameOver = !!gameEndState?.outcome

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

	function handleResize() {
		if (!gameWrapperRef.current || !gameRef.current) return
		const scale = Math.min(
			gameWrapperRef.current.clientWidth / gameRef.current.clientWidth,
			gameWrapperRef.current.clientHeight / gameRef.current.clientHeight,
		)
		setGameScale(scale)
	}

	// Initialize Game Screen Resizing and Event Listeners
	useEffect(() => {
		handleResize()
		window.addEventListener('resize', handleResize)

		// Clean up event listeners
		return () => {
			window.removeEventListener('resize', handleResize)
		}
	}, [])

	return (
		<div className={css.game}>
			<div className={css.playAreaWrapper} ref={gameWrapperRef}>
				<div
					className={css.playArea}
					ref={gameRef}
					style={{transform: `scale(${gameScale})`}}
				>
					<div className={css.grid} />
					<Board
						onClick={handleBoardClick}
						gameEndButton={() => setGameEndModal(true)}
						gameOver={gameOver}
					/>
				</div>
			</div>
			<div className={css.bottom}>
				<Toolbar
					gameOver={gameOver}
					gameEndButton={() => setGameEndModal(true)}
				/>
				{(!isSpectator || isReplayer) && <Hand gameOver={gameOver} />}
			</div>
			<ModalContainer />
			<Chat gameOver={gameOver} />
			<EndGameOverlayContainer
				modalVisible={gameEndModal}
				setModalVisible={setGameEndModal}
				setMenuSection={setMenuSection}
			/>
			<RequiresAvaiableActions />
			<PickRequestSound />
			<TurnStartSound />
		</div>
	)
}

export default Game
