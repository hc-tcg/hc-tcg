import cn from 'classnames'
import {LocalGameState} from 'common/types/game-state'
import {
	getCurrentCoinFlip,
	getGameState,
	getTime,
} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import css from './timer.module.scss'

function Timer() {
	const dispatch = useMessageDispatch()
	const gameState = useSelector(getGameState) as LocalGameState
	const time = useSelector(getTime)
	const currentCoinflip = useSelector(getCurrentCoinFlip)

	const [remainingTime, setRemainingTime] = useState(
		Math.min(__LIMITS__.maxTurnTime, gameState.timer.turnRemaining),
	)

	let remainingSeconds = Math.floor(remainingTime / 1000)

	// Count down timer
	useEffect(() => {
		if (currentCoinflip !== null) return
		setRemainingTime(
			Math.min(__LIMITS__.maxTurnTime * 1000, gameState.timer.turnRemaining),
		)

		const interval = setInterval(() => {
			const remaining =
				gameState.timer.turnRemaining - Math.ceil(Date.now() - time)
			setRemainingTime(
				Math.min(__LIMITS__.maxTurnTime * 1000, Math.max(0, remaining)),
			)
		}, 50)

		return () => clearInterval(interval)
	}, [time, gameState.timer.turnRemaining, currentCoinflip])

	// Last 10 seconds sfx
	useEffect(() => {
		if (
			remainingTime <= 10 &&
			gameState.turn.currentPlayerEntity === gameState.playerEntity
		) {
			dispatch({type: localMessages.SOUND_PLAY, path: '/sfx/Click.ogg'})
		}
	}, [remainingSeconds])

	return (
		<div className={cn(css.timer, css.white)}>
			<p className={css.timeLeft}>Time Left:</p>
			<span>
				{Math.floor(remainingSeconds / 60)}:
				{(remainingSeconds % 60).toString().padStart(2, '0')}
			</span>
		</div>
	)
}

export default Timer
