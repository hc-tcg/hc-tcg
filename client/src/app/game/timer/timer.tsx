import {useDispatch, useSelector} from 'react-redux'
import {useEffect, useState} from 'react'
import cn from 'classnames'
import css from './timer.module.scss'
import {LocalGameState} from 'common/types/game-state'
import {playSound} from 'logic/sound/sound-actions'
import {getCurrentCoinFlip, getGameState, getTime} from 'logic/game/game-selectors'

function Timer() {
	const dispatch = useDispatch()
	const gameState = useSelector(getGameState) as LocalGameState
	const time = useSelector(getTime)
	const currentCoinflip = useSelector(getCurrentCoinFlip)

	const [remainingTime, setRemainingTime] = useState(
		Math.min(__LIMITS__.maxTurnTime, gameState.timer.turnRemaining)
	)

	// Count down timer
	useEffect(() => {
		if (currentCoinflip !== null) return
		setRemainingTime(Math.min(__LIMITS__.maxTurnTime * 1000, gameState.timer.turnRemaining))

		const interval = setInterval(() => {
			const remaining = gameState.timer.turnRemaining - Math.ceil(Date.now() - time)
			setRemainingTime(Math.min(__LIMITS__.maxTurnTime * 1000, Math.max(0, remaining)))
		}, 50)

		return () => clearInterval(interval)
	}, [time, gameState.timer.turnRemaining, currentCoinflip])

	// Last 10 seconds sfx
	useEffect(() => {
		if (remainingTime < 10 && gameState.turn.currentPlayerEntity === gameState.playerEntity) {
			dispatch(playSound('/sfx/Click.ogg'))
		}
	}, [remainingTime])

	// Format time as M:SS
	const timeInfo = new Date(remainingTime)

	return (
		<div className={cn(css.timer, css.white)}>
			<p>Time Left:</p>
			<span>
				{timeInfo.getMinutes()}:{timeInfo.getSeconds().toString().padStart(2, '0')}
			</span>
		</div>
	)
}

export default Timer
