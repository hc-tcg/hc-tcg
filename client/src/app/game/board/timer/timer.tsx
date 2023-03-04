import {useSelector} from 'react-redux'
import {useEffect, useState} from 'react'
import classnames from 'classnames'
import {GameState, PlayerState} from 'types/game-state'
import css from './timer.module.css'
import {
	getGameState,
	getTime,
	getInactivePlayerState,
} from 'logic/game/game-selectors'

const getTimeClass = (time: number, inactiveFollowup: boolean) => {
	if (inactiveFollowup) return css.blue
	if (time > 60) return css.white
	if (time > 20) return css.orange
	return css.red
}

function PlayerInfo() {
	const gameState = useSelector(getGameState) as GameState
	const time = useSelector(getTime)
	const inactivePlayer = useSelector(getInactivePlayerState) as PlayerState

	const [remainingTime, setRemainingTime] = useState(
		Math.min(__LIMITS__.maxTurnTime, gameState.turnRemaining)
	)

	useEffect(() => {
		setRemainingTime(Math.min(__LIMITS__.maxTurnTime, gameState.turnRemaining))
		const interval = setInterval(() => {
			const remaining =
				gameState.turnRemaining - Math.floor((Date.now() - time) / 1000)
			setRemainingTime(Math.max(0, remaining))
		}, 200)
		return () => clearInterval(interval)
	}, [time, gameState.turnRemaining])

	const timeClass = getTimeClass(remainingTime, !!inactivePlayer.followUp)
	return <div className={classnames(css.timer, timeClass)}>{remainingTime}</div>
}

export default PlayerInfo
