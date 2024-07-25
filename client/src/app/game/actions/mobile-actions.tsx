import css from './actions.module.scss'
import cn from 'classnames'
import Slot from '../board/board-slot'
import {useSelector, useDispatch} from 'react-redux'
import {endTurn, endTurnAction, setOpenedModal} from 'logic/game/game-actions'
import {
	getPlayerStateById,
	getAvailableActions,
	getCurrentCoinFlip,
	getGameState,
	getPlayerState,
	getCurrentPickMessage,
} from 'logic/game/game-selectors'
import {LocalGameState} from 'common/types/game-state'
import CoinFlip from 'components/coin-flip'
import Button from 'components/button'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {SlotInfo} from 'common/types/server-requests'
import {shouldShowEndTurnModal} from '../modals/end-turn-modal'
import classNames from 'classnames'

type Props = {
	onClick: (pickInfo: SlotInfo) => void
	localGameState: LocalGameState
	id?: string
}

const MobileActions = ({onClick, localGameState, id}: Props) => {
	const currentPlayer = useSelector(getPlayerStateById(localGameState.turn.currentPlayerId))
	const gameState = useSelector(getGameState)
	const playerState = useSelector(getPlayerState)
	const boardState = currentPlayer?.board
	const singleUse = boardState?.singleUse || null
	const singleUseCardUsed = boardState?.singleUseCardUsed || false
	const availableActions = useSelector(getAvailableActions)
	const currentCoinFlip = useSelector(getCurrentCoinFlip)
	const pickMessage = useSelector(getCurrentPickMessage)
	const settings = useSelector(getSettings)
	const dispatch = useDispatch()

	if (!gameState || !playerState) return <main>Loading</main>

	function handleEndTurn() {
		if (shouldShowEndTurnModal(availableActions, settings)) {
			dispatch(endTurnAction())
		} else {
			dispatch(endTurn())
		}
	}

	const Status = () => {
		const waitingForOpponent =
			availableActions.includes('WAIT_FOR_OPPONENT_ACTION') && availableActions.length === 1
		const endTurn = availableActions.includes('END_TURN')
		const changeHermit = availableActions.includes('CHANGE_ACTIVE_HERMIT')

		// TODO: Show coin flip results for longer amount of time
		if (currentCoinFlip) {
			return <CoinFlip key={currentCoinFlip.name} {...currentCoinFlip} />
		}

		let message = ''

		if (pickMessage) {
			message = pickMessage
		} else if (waitingForOpponent) {
			message = "Waiting for opponent's action..."
		} else if (changeHermit && availableActions.length === 1) {
			message = 'Select a new active Hermit'
		} else if (endTurn && changeHermit && availableActions.length === 2) {
			message = 'Switch to a new Hermit or end your turn'
		}

		if (message == '') return null

		return (
			<>
				<p className={css.message}>{message}</p>
			</>
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
					onClick={handleClick}
					entity={singleUse?.slot}
				/>
			</div>
		)
	}

	const ActionButtons = () => {
		function handleAttack() {
			dispatch(setOpenedModal('attack'))
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
					className={css.mobileButton}
					onClick={handleAttack}
					disabled={!attackOptions}
				>
					Attack
				</Button>
				<Button
					variant={!availableActions.includes('END_TURN') ? 'default' : 'error'}
					size="small"
					className={css.mobileButton}
					onClick={handleEndTurn}
					disabled={!availableActions.includes('END_TURN')}
				>
					End Turn
				</Button>
			</div>
		)
	}

	let status = Status()

	return (
		<div id={id} className={cn(css.actions, css.mobile)}>
			<div className={css.actionSection} id={css.singleUse}>
				{SingleUseSlot()}
			</div>

			{status && <div className={classNames(css.actionSection, css.status)}>{status}</div>}

			{status === null && (
				<div className={classNames(css.actionSection, css.buttons)}>{ActionButtons()}</div>
			)}
		</div>
	)
}

export default MobileActions
