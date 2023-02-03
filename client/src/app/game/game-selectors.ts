import {RootState} from 'store'
import {PlayerState} from 'types/game-state'

export const getPlayerState = (state: RootState) => {
	const gameState = state.gameState
	const playerId = state.playerId
	if (!gameState || !playerId) return null
	return gameState.players[playerId]
}

export const getOpponentState = (state: RootState) => {
	const gameState = state.gameState
	const opponentId = state.opponentId
	if (!gameState || !opponentId) return null
	return gameState.players[opponentId]
}

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
	if (!state.gameState) return null
	const {players, turnPlayerId} = state.gameState
	const playerState = players[turnPlayerId]

	const flips = playerState.coinFlips
	let multiplier = 1
	if (flips['invisibility_potion']) {
		multiplier *= flips['invisibility_potion']?.[0] === 'heads' ? 2 : 0
	}

	return multiplier === 1 ? null : multiplier
}
