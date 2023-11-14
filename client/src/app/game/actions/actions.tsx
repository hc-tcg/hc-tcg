import css from './actions.module.scss'
import cn from 'classnames'
import Slot from '../board/board-slot'
import {useSelector, useDispatch} from 'react-redux'
import {attackAction, endTurn, endTurnAction} from 'logic/game/game-actions'
import {
	getPlayerStateById,
	getAvailableActions,
	getCurrentCoinFlip,
	getPickProcess,
	getGameState,
	getPlayerState,
	getCurrentPickMessage,
} from 'logic/game/game-selectors'
import {PickProcessT, PickedSlotT, SlotTypeT} from 'common/types/pick-process'
import {LocalGameState} from 'common/types/game-state'
import {getPlayerId} from 'logic/session/session-selectors'
import CoinFlip from 'components/coin-flip'
import Button from 'components/button'
import {CardTypeT} from 'common/types/cards'
import {SINGLE_USE_CARDS} from 'common/cards'
import {getSettings} from 'logic/local-settings/local-settings-selectors'

const formattingMap: Record<string, string> = {
	hermit: 'Hermit',
	effect: 'attach effect',
	single_use: 'single use effect',
}

const getFormattedList = (list: (CardTypeT | SlotTypeT)[]): string => {
	const formattedList: string[] = []
	for (const e of list) {
		formattedList.push(formattingMap[e] ? formattingMap[e] : e)
	}

	if (formattedList.length === 1) return formattedList[0]

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
		req.active === true ? 'active Hermit' : req.active === false ? 'AFK Hermits' : 'Hermits'

	if (req.slot[0] === 'hand' && req.slot.length === 1) {
		location = 'hand'
	}

	const adjacentMap = {
		active: 'active Hermit',
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
		cardType =
			(req.type.length < 4 ? getFormattedList(req.type) : '') +
			(req.amount > 1 ? ' cards' : ' card')
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

type Props = {
	onClick: (meta: PickedSlotT) => void
	localGameState: LocalGameState
	mobile?: boolean
	id?: string
}

const Actions = ({onClick, localGameState, mobile, id}: Props) => {
	const currentPlayer = useSelector(getPlayerStateById(localGameState.turn.currentPlayerId))
	const gameState = useSelector(getGameState)
	const playerState = useSelector(getPlayerState)
	const playerId = useSelector(getPlayerId)
	const boardState = currentPlayer?.board
	const singleUseCard = boardState?.singleUseCard || null
	const singleUseCardUsed = boardState?.singleUseCardUsed || false
	const availableActions = useSelector(getAvailableActions)
	const currentCoinFlip = useSelector(getCurrentCoinFlip)
	const pickProcess = useSelector(getPickProcess)
	const pickMessage = useSelector(getCurrentPickMessage)
	const player = useSelector(getPlayerState)
	const settings = useSelector(getSettings)
	const dispatch = useDispatch()

	const turn = localGameState.turn.currentPlayerId === playerId

	if (!gameState || !playerState) return <main>Loading</main>

	const Status = () => {
		const waitingForOpponent =
			availableActions.includes('WAIT_FOR_OPPONENT_ACTION') && availableActions.length === 1
		let turnMsg = turn ? 'Your Turn' : "Opponent's Turn"
		if (pickMessage) turnMsg = 'Pick a card'
		const endTurn = availableActions.includes('END_TURN')
		const changeHermit = availableActions.includes('CHANGE_ACTIVE_HERMIT')

		// TODO: Show coin flip results for longer amount of time
		if (currentCoinFlip) {
			return (
				<div id={css.status}>
					<CoinFlip key={currentCoinFlip.name} {...currentCoinFlip} />
				</div>
			)
		}

		let message = ''

		if (pickMessage) {
			message = pickMessage
		} else if (waitingForOpponent) {
			message = "Waiting for opponent's action..."
		} else if (endTurn && availableActions.length === 1) {
			message = 'End your turn when ready'
		} else if (changeHermit && availableActions.length === 1) {
			message = 'Select a new active Hermit'
		} else if (endTurn && changeHermit && availableActions.length === 2) {
			message = 'Switch to a new Hermit or end your turn'
		}

		// @TODO will be removed once all picks are pick requests
		if (pickProcess) {
			message = getPickProcessMessage(pickProcess, gameState.turn.currentPlayerId, playerId)
		}

		return (
			<div id={css.status}>
				<p className={css.turn}>{turnMsg}</p>
				<p className={css.message}>{message}</p>
			</div>
		)
	}

	const SingleUseSlot = () => {
		const isPlayable =
			availableActions.includes('PLAY_SINGLE_USE_CARD') ||
			availableActions.includes('REMOVE_EFFECT')

		const handleClick = () => {
			isPlayable &&
				onClick({
					slot: {
						type: 'single_use',
						card: singleUseCard,
						index: 0,
						info: singleUseCard ? SINGLE_USE_CARDS[singleUseCard.cardId] : null,
					},
					playerId: localGameState.turn.currentPlayerId,
				})
		}

		return (
			<div className={cn(css.slot, {[css.used]: singleUseCardUsed})}>
				<Slot
					card={singleUseCard}
					type={'single_use'}
					onClick={handleClick}
					ailments={gameState.ailments}
				/>
			</div>
		)
	}

	const ActionButtons = () => {
		function handleAttack() {
			dispatch(attackAction())
		}
		function handleEndTurn() {
			if (availableActions.length === 1 || settings.confirmationDialogs === 'off') {
				dispatch(endTurn())
			} else {
				dispatch(endTurnAction())
			}
		}

		const attackOptions =
			availableActions.includes('SINGLE_USE_ATTACK') ||
			availableActions.includes('PRIMARY_ATTACK') ||
			availableActions.includes('SECONDARY_ATTACK')

		return (
			<div className={css.buttons}>
				<Button
					variant="default"
					size="small"
					style={{height: '34px'}}
					onClick={handleAttack}
					disabled={!attackOptions}
				>
					Attack
				</Button>
				<Button
					variant={!availableActions.includes('END_TURN') ? 'default' : 'error'}
					size="small"
					style={{height: '34px'}}
					onClick={handleEndTurn}
					disabled={!availableActions.includes('END_TURN')}
				>
					End Turn
				</Button>
			</div>
		)
	}

	return (
		<div id={id} className={cn(css.actions, css.desktop)}>
			{Status()}
			<div className={cn(css.actionSection, !turn && css.fade)}>
				<h2>Actions</h2>
				{ActionButtons()}
			</div>
			{SingleUseSlot()}
		</div>
	)
}

export default Actions
