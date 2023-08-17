import {useDispatch, useSelector} from 'react-redux'
import {useEffect, useState} from 'react'
import cn from 'classnames'
import css from './timer.module.scss'
import {LocalGameState} from 'common/types/game-state'
import {playSound} from 'logic/sound/sound-actions'
import {getGameState, getTime} from 'logic/game/game-selectors'

function Timer() {
	const dispatch = useDispatch()
	const gameState = useSelector(getGameState) as LocalGameState
	const time = useSelector(getTime)
	const [remainingTime, setRemainingTime] = useState(
		Math.min(__LIMITS__.maxTurnTime, gameState.timer.turnRemaining)
	)

	const graceTime = 1

	// Count down timer
	useEffect(() => {
		setRemainingTime(Math.min(__LIMITS__.maxTurnTime, gameState.timer.turnRemaining))
		const interval = setInterval(() => {
			const remaining =
				gameState.timer.turnRemaining - graceTime - Math.floor((Date.now() - time) / 1000)
			setRemainingTime(Math.min(__LIMITS__.maxTurnTime, Math.max(0, remaining)))
		}, 200)

		return () => clearInterval(interval)
	}, [time, gameState.timer.turnRemaining])

	// Last 10 seconds sfx
	useEffect(() => {
		if (remainingTime < 10 && gameState.turn.currentPlayerId === gameState.playerId) {
			dispatch(playSound('/sfx/Click.ogg'))
		}
	}, [remainingTime])

	// Format time as M:SS
	const timeFormat = new Date(remainingTime * 1000).toISOString().substring(15, 19)

	return (
		<div className={cn(css.timer, css.white)}>
			<p>Time Left:</p>
			<span>{timeFormat}</span>
		</div>
	)
}

export default Timer
