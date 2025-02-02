import cn from 'classnames'
import {LocalGameState} from 'common/types/game-state'
import {SlotInfo} from 'common/types/server-requests'
import Button from 'components/button'
import CoinFlip from 'components/coin-flip'
import {
	getAvailableActions,
	getCurrentCoinFlip,
	getCurrentPickMessage,
	getGameState,
	getIsSpectator,
	getPlayerEntity,
	getPlayerState,
	getPlayerStateByEntity,
} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useSelector} from 'react-redux'
import Slot from '../board/board-slot'
import css from './actions.module.scss'

type Props = {
	onClick: (pickInfo: SlotInfo) => void
	localGameState: LocalGameState
	mobile?: boolean
	id?: string
}

const Actions = ({onClick, localGameState, id}: Props) => {
	const currentPlayer = useSelector(
		getPlayerStateByEntity(localGameState.turn.currentPlayerEntity),
	)
	const gameState = useSelector(getGameState)
	const playerState = useSelector(getPlayerState)
	const playerEntity = useSelector(getPlayerEntity)
	const isSpectator = useSelector(getIsSpectator)
	const boardState = currentPlayer?.board
	const singleUseCardUsed = boardState?.singleUseCardUsed || false
	const availableActions = useSelector(getAvailableActions)
	const currentCoinFlip = useSelector(getCurrentCoinFlip)
	const pickMessage = useSelector(getCurrentPickMessage)
	const dispatch = useMessageDispatch()

	const turn = localGameState.turn.currentPlayerEntity === playerEntity

	if (!gameState || !playerState) return <main>Loading</main>

	const Status = () => {
		const waitingForOpponent =
			availableActions.includes('WAIT_FOR_OPPONENT_ACTION') &&
			availableActions.length === 1
		let turnMsg
		if (isSpectator) {
			turnMsg = `${currentPlayer.censoredPlayerName}'s Turn`
		} else {
			turnMsg = turn ? 'Your Turn' : "Opponent's Turn"
		}

		if (pickMessage) turnMsg = 'Pick a card'
		const endTurn = availableActions.includes('END_TURN')
		const changeHermit = availableActions.includes('CHANGE_ACTIVE_HERMIT')

		// TODO: Show coin flip results for longer amount of time
		if (currentCoinFlip) {
			return (
				<div id={css.status}>
					<CoinFlip
						key={currentCoinFlip.name}
						{...currentCoinFlip}
						amount={currentCoinFlip.amount}
						headImage={currentCoinFlip.headImage}
					/>
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
				boardState &&
				onClick({
					slotType: 'single_use',
					slotEntity: boardState.singleUse.slot,
					card: boardState.singleUse.card,
				})
		}

		return (
			<div className={cn(css.slot, {[css.used]: singleUseCardUsed})}>
				<Slot
					card={boardState?.singleUse.card || null}
					type={'single_use'}
					entity={boardState?.singleUse.slot}
					onClick={handleClick}
				/>
			</div>
		)
	}

	const ActionButtons = () => {
		function handleAttack() {
			dispatch({type: localMessages.GAME_MODAL_OPENED_SET, id: 'attack'})
		}
		function handleEndTurn() {
			dispatch({type: localMessages.GAME_ACTIONS_END_TURN})
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
			{!isSpectator && (
				<div className={cn(css.actionSection, !turn && css.fade)}>
					<h2>Actions</h2>
					{ActionButtons()}
				</div>
			)}
			{SingleUseSlot()}
		</div>
	)
}

export default Actions
