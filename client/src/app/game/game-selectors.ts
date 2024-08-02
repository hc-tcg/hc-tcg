import {LocalPlayerState} from 'common/types/game-state'
import {getOpponentState, getPlayerState} from 'logic/game/game-selectors'
import {RootState} from 'store'

const getActiveRow = (playerState: LocalPlayerState | null) => {
	if (!playerState) return null
	const {rows, activeRow} = playerState.board
	if (activeRow === null) return null
	const activeHermit = rows.find(
		(row) => row.entity == playerState.board.activeRow,
	)
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
