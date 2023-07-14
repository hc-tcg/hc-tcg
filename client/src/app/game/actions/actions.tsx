import css from './actions.module.scss'
import cn from 'classnames'
import Slot from '../board/board-slot'
import {useSelector, useDispatch} from 'react-redux'
import {setOpenedModal} from 'logic/game/game-actions'
import {
	getPlayerStateById,
	getAvailableActions,
	getCurrentCoinFlip,
	getPickProcess,
	getGameState,
	getPlayerState,
} from 'logic/game/game-selectors'
import {PickProcessT, PickedSlotT, SlotTypeT} from 'common/types/pick-process'
import {LocalGameState} from 'common/types/game-state'
import {getPlayerId} from 'logic/session/session-selectors'
import CoinFlip from 'components/coin-flip'
import Button from 'components/button'
import {CardTypeT} from 'common/types/cards'
import {SINGLE_USE_CARDS} from 'common/cards'

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

type Props = {
	onClick: (meta: PickedSlotT) => void
	localGameState: LocalGameState
	mobile?: boolean
	id?: string
}

const Actions = ({onClick, localGameState, mobile, id}: Props) => {
	const currentPlayer = useSelector(getPlayerStateById(localGameState.currentPlayerId))
	const gameState = useSelector(getGameState)
	const playerState = useSelector(getPlayerState)
	const playerId = useSelector(getPlayerId)
	const boardState = currentPlayer?.board
	const singleUseCard = boardState?.singleUseCard || null
	const singleUseCardUsed = boardState?.singleUseCardUsed || false
	const availableActions = useSelector(getAvailableActions)
	const currentCoinFlip = useSelector(getCurrentCoinFlip)
	const pickProcess = useSelector(getPickProcess)
	const player = useSelector(getPlayerState)
	const dispatch = useDispatch()

	if (!gameState || !playerState) return <main>Loading</main>

	const Status = () => {
		const turn = localGameState.currentPlayerId === playerId
		const followup = availableActions.includes('FOLLOW_UP') && availableActions.length === 1
		const opponentFollowup = availableActions.includes('WAIT_FOR_OPPONENT_FOLLOWUP')
		const turnMsg = turn ? 'Your Turn' : followup ? 'Follow Up' : "Opponent's Turn"
		const knockedOut = player?.board.activeRow === null && player.lives !== 3 && turn
		const changeHermit =
			availableActions.includes('CHANGE_ACTIVE_HERMIT') && availableActions.length === 1

		// TODO: Show coin flip results for longer amount of time
		if (currentCoinFlip) {
			return <CoinFlip key={currentCoinFlip.name} {...currentCoinFlip} />
		}

		return (
			<>
				<p className={css.turn}>{turnMsg}</p>
				<p>
					{knockedOut && 'Activate an AFK Hermit'}
					{changeHermit && 'Select a new active hermit'}
					{opponentFollowup && "Waiting for opponent's action..."}
					{pickProcess && getPickProcessMessage(pickProcess, gameState.currentPlayerId, playerId)}
				</p>
			</>
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
					playerId: localGameState.currentPlayerId,
				})
		}

		return (
			<div className={cn(css.slot, {[css.used]: singleUseCardUsed})}>
				<Slot card={singleUseCard} type={'single_use'} onClick={handleClick} />
			</div>
		)
	}

	const ActionButtons = () => {
		function handleAttack() {
			dispatch(setOpenedModal('attack'))
		}

		const attackOptions =
			availableActions.includes('ZERO_ATTACK') ||
			availableActions.includes('PRIMARY_ATTACK') ||
			availableActions.includes('SECONDARY_ATTACK')

		return (
			<div className={css.buttons}>
				<Button
					variant="default"
					size="small"
					style={{height: '32px'}}
					onClick={handleAttack}
					disabled={!attackOptions}
				>
					Attack
				</Button>
			</div>
		)
	}

	return (
		<div
			id={id}
			className={cn(css.actions, {
				[css.mobile]: mobile,
				[css.desktop]: !mobile,
			})}
		>
			<div className={css.actionSection} id={css.singleUse}>
				<h2>Single Use Card</h2>
				{SingleUseSlot()}
			</div>
			<div className={css.actionSection} id={css.status}>
				<h2>Game State</h2>
				{Status()}
			</div>
			<div className={css.actionSection} id={css.buttons}>
				<h2>Actions</h2>
				{ActionButtons()}
			</div>
		</div>
	)
}

export default Actions
