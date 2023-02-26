import {useSelector} from 'react-redux'
import {useEffect, useState} from 'react'
import classnames from 'classnames'
import {GameState, PlayerState} from 'types/game-state'
import css from './timer.module.css'
import {getGameState, getInactivePlayerState} from 'logic/game/game-selectors'

const getRemainingTime = (turnTime: number) => {
	const newTime = Math.ceil(
		(turnTime + 1000 * __LIMITS__.maxTurnTime - Date.now()) / 1000
	)
	return Math.max(newTime, 0)
}

const getTimeClass = (time: number, inactiveFollowup: boolean) => {
	if (inactiveFollowup) return css.blue
	if (time > 60) return css.white
	if (time > 20) return css.orange
	return css.red
}

function PlayerInfo() {
	const gameState = useSelector(getGameState) as GameState
	const inactivePlayer = useSelector(getInactivePlayerState) as PlayerState

	const [remainingTime, setRemainingTime] = useState(
		getRemainingTime(gameState.turnTime)
	)

	useEffect(() => {
		const interval = setInterval(() => {
			setRemainingTime(getRemainingTime(gameState.turnTime))
		}, 100)
		return () => clearInterval(interval)
	}, [gameState.turnTime])

	const timeClass = getTimeClass(remainingTime, !!inactivePlayer.followUp)
	return <div className={classnames(css.timer, timeClass)}>{remainingTime}</div>
}

export default PlayerInfo
