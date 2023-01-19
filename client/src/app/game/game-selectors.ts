import {RootState} from 'store'
export const getActiveRow = (state: RootState) => {
	const gameState = state.gameState
	const playerId = state.playerId
	if (!gameState || !playerId) return null
	const playerBoard = gameState.players[playerId].board
	if (playerBoard.activeRow === null) return null
	const activeHermit = playerBoard.rows[playerBoard.activeRow]
	if (!activeHermit) return null
	return activeHermit
}

export const getOpponentActiveRow = (state: RootState) => {
	const gameState = state.gameState
	const opponentId = state.opponentId
	if (!gameState || !opponentId) return null
	const playerBoard = gameState.players[opponentId].board
	if (playerBoard.activeRow === null) return null
	const activeHermit = playerBoard.rows[playerBoard.activeRow]
	if (!activeHermit) return null
	return activeHermit
}
