import {useEffect, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import classnames from 'classnames'
import HealthBar from 'components/health-bar'
import Coin from 'components/coin'
import {GameState, PlayerState, BoardRowT} from 'types/game-state'
import {PickedCardT} from 'types/pick-process'
import css from './board.module.css'
import Slot from './board-slot'
import BoardRow from './board-row'

import {getPlayerId} from 'logic/session/session-selectors'
import {
	getPlayerStateById,
	getAvailableActions,
} from 'logic/game/game-selectors'
import {endTurn} from 'logic/game/game-actions'
/*
TODO:
- Indicate when it is players turn
	- Don't allow clicking on slots on the other side
*/

type Props = {
	onClick: (meta: PickedCardT) => void
	gameState: GameState
}

type FlipInfo = {
	shown: boolean
	value: Array<'heads' | 'tails'>
}

// TODO - Use selectors instead of passing gameState
function Board({onClick, gameState}: Props) {
	const playerId = useSelector(getPlayerId)
	const currentPlayer = useSelector(getPlayerStateById(gameState.turnPlayerId))
	const boardState = currentPlayer?.board
	const singleUseCard = boardState?.singleUseCard || null
	const singleUseCardUsed = boardState?.singleUseCardUsed || false
	const availableActions = useSelector(getAvailableActions)
	const dispatch = useDispatch()

	useEffect(() => {
		if(gameState.turnPlayerId === playerId) {
			let audioStatus = localStorage.getItem("soundOn");
			if(audioStatus === null) {
				localStorage.setItem("soundOn", "on");
				audioStatus = "on";
			}
			if(audioStatus === "on") {
				let audio = new Audio("/sfx/Click.ogg");
				audio.play();
			}
		}
	}, [gameState.turnPlayerId])

	// --- coin flip logic start ---
	const [coinFlipInfo, setCoinFlipInfo] = useState<Record<string, FlipInfo>>({})
	useEffect(() => {
		const coinFlips = currentPlayer?.coinFlips || {}
		const newInfo = {} as Record<string, FlipInfo>
		Object.entries(coinFlips).forEach(([key, flip]) => {
			if (!coinFlipInfo[key]) {
				newInfo[key] = {shown: false, value: flip}
			} else {
				newInfo[key] = coinFlipInfo[key]
			}
		})

		setCoinFlipInfo(newInfo)

		const timeout = setTimeout(() => {
			setCoinFlipInfo((oldInfo) =>
				Object.entries(oldInfo).reduce((result, [key, value]) => {
					return {
						...result,
						[key]: {
							...value,
							shown: true,
						},
					}
				}, {})
			)
		}, 2500)
		return () => clearTimeout(timeout)
	}, [currentPlayer?.coinFlips])

	const coinFlip =
		Object.values(coinFlipInfo).find((info) => !info.shown)?.value || null

	// --- coin flip logic end ---

	const handeRowClick = (
		playerId: string,
		rowIndex: number,
		rowState: BoardRowT | null,
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
		dispatch(endTurn())
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
		if (coinFlip) {
			return <Coin value={coinFlip} />
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
				<div className={css.playerInfo}>
					<div className={css.playerName}>{player1.playerName}</div>
					{gameState.turnPlayerId === player1.id ? (
						<div className={css.currentTurn}>
							{gameState.turnPlayerId === playerId
								? 'Your turn'
								: "Opponent's turn"}
						</div>
					) : null}
					<div className={css.dynamicSpace} />
					<HealthBar lives={player1.lives} />
				</div>
				{makeRows(player1, 'left')}
			</div>

			<div className={css.middle}>
				<img src="images/tcg1.png" draggable="false" width="100" />
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
				<div className={css.playerInfo}>
					<HealthBar lives={player2.lives} />
					<div className={css.dynamicSpace} />
					{gameState.turnPlayerId === player2.id ? (
						<div className={css.currentTurn}>
							{gameState.turnPlayerId === playerId
								? 'Your turn'
								: "Opponent's turn"}
						</div>
					) : null}
					<div className={css.playerName}>{player2.playerName}</div>
				</div>
				{makeRows(player2, 'right')}
			</div>
		</div>
	)
}

export default Board
