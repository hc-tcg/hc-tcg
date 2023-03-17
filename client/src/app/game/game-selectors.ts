import {RootState} from 'store'
import {PlayerState} from 'common/types/game-state'
import {
	getPlayerState,
	getOpponentState,
	getCurrentPlayerState,
} from 'logic/game/game-selectors'

const getActiveRow = (playerState: PlayerState | null) => {
	if (!playerState) return null
	const {rows, activeRow} = playerState.board
	if (activeRow === null) return null
	const activeHermit = rows[activeRow]
	if (!activeHermit) return null
	return activeHermit
}

export const getPlayerActiveRow = (state: RootState) => {
	const playerState = getPlayerState(state)
	return getActiveRow(playerState)
}

export const getOpponentActiveRow = (state: RootState) => {
	const playerState = getOpponentState(state)
	return getActiveRow(playerState)
}

export const getMultiplier = (state: RootState) => {
	const playerState = getCurrentPlayerState(state)
	if (!playerState) return null

	const custom = playerState.custom

	let multiplier = 1
	if (custom['invisibility_potion']) {
		multiplier *= custom['invisibility_potion'] === 'heads' ? 0 : 2
	}

	return multiplier === 1 ? null : multiplier
}
