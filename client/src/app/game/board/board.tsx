import {useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import classnames from 'classnames'
import CoinFlip from 'components/coin-flip'
import {GameState, PlayerState, RowState} from 'common/types/game-state'
import {PickedCardT} from 'common/types/pick-process'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {getPlayerId} from 'logic/session/session-selectors'
import {
	getPlayerStateById,
	getAvailableActions,
	getCurrentCoinFlip,
} from 'logic/game/game-selectors'
import {setOpenedModal, endTurn} from 'logic/game/game-actions'
import css from './board.module.css'
import Slot from './board-slot'
import BoardRow from './board-row'
import PlayerInfo from './player-info'
import Timer from './timer'

// TODO - Don't allow clicking on slots on the other side

type Props = {
	onClick: (meta: PickedCardT) => void
	gameState: GameState
}

// TODO - Use selectors instead of passing gameState
function Board({onClick, gameState}: Props) {
	const playerId = useSelector(getPlayerId)
	const currentPlayer = useSelector(getPlayerStateById(gameState.turnPlayerId))
	const boardState = currentPlayer?.board
	const singleUseCard = boardState?.singleUseCard || null
	const singleUseCardUsed = boardState?.singleUseCardUsed || false
	const availableActions = useSelector(getAvailableActions)
	const currentCoinFlip = useSelector(getCurrentCoinFlip)
	const settings = useSelector(getSettings)
	const dispatch = useDispatch()

	useEffect(() => {
		try {
			if (gameState.turnPlayerId === playerId) {
				if (settings.soundVolume !== '0') {
					const audio = new Audio('/sfx/Click.ogg')
					audio.volume = Number(settings.soundVolume) / 100
					audio.play()
				}
			}
		} catch (err) {
			console.log(err)
		}
	}, [gameState.turnPlayerId])

	const handeRowClick = (
		playerId: string,
		rowIndex: number,
		rowState: RowState | null,
		meta: any
	) => {
		onClick({
			...meta,
			playerId,
			rowIndex,
			rowHermitCard: rowState?.hermitCard || null,
		})
	}

	const handleEndTurn = () => {
		if (
			availableActions.length === 1 ||
			settings.confirmationDialogs === 'off'
		) {
			dispatch(endTurn())
		} else {
			dispatch(setOpenedModal('end-turn'))
		}
	}

	const makeRows = (playerState: PlayerState, type: 'left' | 'right') => {
		const rows = playerState.board.rows
		return new Array(5).fill(null).map((_, index) => {
			if (!rows[index]) throw new Error('Rendering board row failed')
			return (
				<BoardRow
					key={index}
					rowState={rows[index]}
					active={index === playerState.board.activeRow}
					onClick={handeRowClick.bind(null, playerState.id, index, rows[index])}
					type={type}
				/>
			)
		})
	}

	const renderMiddle = () => {
		if (currentCoinFlip) {
			return <CoinFlip key={currentCoinFlip.name} {...currentCoinFlip} />
		}

		if (availableActions.includes('WAIT_FOR_OPPONENT_FOLLOWUP')) {
			return (
				<div className={css.opponentFollowup}>
					Waiting for opponent's action.
				</div>
			)
		}

		if (availableActions.includes('WAIT_FOR_TURN')) {
			return null
		}

		return (
			<button
				onClick={handleEndTurn}
				disabled={!availableActions.includes('END_TURN')}
			>
				End Turn
			</button>
		)
	}

	const [player1, player2] = gameState.order.map(
		(playerId) => gameState.players[playerId]
	)
	return (
		<div className={css.board}>
			<div className={css.leftPlayer}>
				<PlayerInfo player={player1} dir="left" />
				{makeRows(player1, 'left')}
			</div>

			<div className={css.middle}>
				<Timer />
				{renderMiddle()}
				<div
					className={classnames(css.singleUseSlot, {
						[css.used]: singleUseCardUsed,
					})}
				>
					<Slot
						onClick={
							availableActions.includes('PLAY_SINGLE_USE_CARD') ||
							availableActions.includes('REMOVE_EFFECT')
								? () =>
										onClick({
											slotType: 'single_use',
											card: singleUseCard,
											playerId: gameState.turnPlayerId,
										})
								: undefined
						}
						card={singleUseCard}
						type={'single_use'}
					/>
				</div>
			</div>
			<div className={css.rightPlayer}>
				<PlayerInfo player={player2} dir="right" />
				{makeRows(player2, 'right')}
			</div>
		</div>
	)
}

export default Board
